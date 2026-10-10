# UML-схемы бизнес-процессов работы с роутером

На схемах отражены только вызовы публичного API роутера:

- `Router/router:MaskResolver`
- `Router/router:UrlRewriter`
- `Router/router:Router.navigate`
- `Router/router:Router.history`

Плюс `Router/router:Router.url` (`IRouterUrl`) — именно через него учитываются сторонние сервисы
(`appRoot`/`appAlias`).

## Сводка процессов

| # | Процесс | Публичные вызовы |
|---|---------|------------------|
| 1 | Построение URL для ссылки | `maskResolver.calculateState/calculateUrl`, `urlRewriter.getReverse`, `url.getRealUrl` |
| 2 | Разбор параметров из URL | `urlRewriter.get`, `url.getLogicUrl`, `maskResolver.calculateUrlParams` |
| 3 | SPA-переход страница 1 → страница 2 | `Router.navigate`, `history.getCurrentState`, `history.push` |
| 4 | SPA pagex-переход | `NavigationController.navigate` → `Router.navigate` |
| 5 | Переход по кнопкам браузера назад/вперёд | `history.getCurrentState/getPrevState/getNextState`, `history.back/forward`, `Router.navigate` |
| 6 | Переход без новой записи в истории | `Router.replaceState`, `history.replaceState` |
| 7 | Смена URL без перестроения страницы | `Router.navigatePushState`/`navigateReplaceState`, `history.push`/`replaceState` |
| 8 | Инициализация роутера / стартовый URL | `getRootRouter`/`createNewRouter`, `UrlRewriter.getInstance`, `history` (инициализация) |
| 9 | Построение страницы на сервере (SSR) | `extractS3modFromUrl`/`getAppNameByUrl`, `sendPartialHtml`, `enablePartialSend`/`disablePartialSend` |
| 10 | Отправка частичного HTML при сборе зависимостей | `UICommon/Deps:addPageDeps` → `sendPartialHtml` |

---

# Блок A. Клиентские процессы (SPA)

## 1. Построение URL для ссылки (с учётом сторонних сервисов)

Источник: `Router/_private/Reference.tsx` → `Router/_private/shared/calculateReferenceHref.ts`.

```mermaid
flowchart TD
    Start(["Reference / calculateReferenceHref"]) --> CalcState["maskResolver.calculateState<br/>(state-маска, параметры, currentUrl?)"]
    CalcState --> State["state<br/>(логический URL)"]
    CalcState --> HasHref{"задан href<br/>(красивый URL)?"}
    HasHref -- "да" --> RevCur["urlRewriter.getReverse<br/>(currentUrl || url.getStateUrl())"]
    RevCur --> CalcUrl["maskResolver.calculateUrl<br/>(href-маска, параметры, url)"]
    CalcUrl --> Href["href"]
    HasHref -- "нет" --> RevState["urlRewriter.getReverse<br/>(state)"]
    RevState --> RealUrl["url.getRealUrl(_href)<br/>+ appAlias<br/>+ appRoot сервиса"]
    RealUrl --> Href
    State --> Result(["итог { state, href }<br/>→ атрибут href ссылки"])
    Href --> Result
```

## 2. Разбор параметров из URL (с учётом сторонних сервисов)

Источник: `Router/_private/Route.tsx` (`_applyNewUrl`/`_checkUrlResolved`) →
`Router/_private/MaskResolver.ts` (`calculateUrlParams`).

```mermaid
flowchart TD
    Start(["Route (маска)"]) --> GetLogic["url.getLogicUrl()<br/>снятие сервиса/алиаса"]
    GetLogic --> Rewrite["urlRewriter.get(logicUrl)<br/>красивый → логический"]
    Rewrite --> GetState["url.getStateUrl()"]
    GetState --> CalcParams["maskResolver.calculateUrlParams<br/>(маска, stateUrl)"]
    CalcParams --> Parse["UrlParamsGetter<br/>PathParams / QueryParams<br/>(path, query, fragment)"]
    Parse --> Result(["объект параметров<br/>{ pageId, scopeId, ... }<br/>→ детям Route"])
```

## 3. SPA-переход со страницы 1 на страницу 2 (`Router.navigate`)

Источник: `Router/_private/Router/Router.ts` (`navigate`, `_tryApplyNewState`),
`Router/_private/Router/RouterManager.ts`, `Router/_private/History.ts`.

```mermaid
flowchart TD
    Start(["Router.navigate<br/>(newState, callback?, errback?)"]) --> Rew["urlRewriter.get<br/>(newState.state)"]
    Rew --> Pretty["urlRewriter.getReverse<br/>+ url.getRealUrl<br/>(pretty href)"]
    Pretty --> Cur["history.getCurrentState()"]
    Cur --> Guard{"совпадает<br/>или уже в переходе?"}
    Guard -- "да" --> Exit(["выход"])
    Guard -- "нет" --> Before["_manager.callBeforeUrlChange<br/>Route: onBeforeChange /<br/>onEnter / onLeave"]
    Before --> App{"приложение (appName)<br/>изменилось?"}
    App -- "да" --> FullReload["url.location.href = href<br/>(полная перезагрузка)"]
    App -- "нет" --> Accepted{"переход принят?"}
    Accepted -- "нет" --> Errback["errback(err)"]
    Accepted -- "да" --> Push["history.push(rewrittenState)<br/>внутр. история +<br/>window.history.pushState"]
    Push --> After["_manager.callAfterUrlChange<br/>Route: getDataToRender<br/>Reference: пересчёт href"]
    After --> Done(["страница 2 отображена"])
```

## 4. SPA pagex-переход (`NavigationController.navigate` → `Router.navigate`)

Источник: `engine-saby-page/client/Page/_base/NavigationController.ts` (`navigate`).

```mermaid
flowchart TD
    Start(["NavigationController.navigate<br/>(pageId, queryParams, isBlank?)"]) --> Build{"routeMask задан?"}
    Build -- "да" --> NavState["getNavigateState:<br/>maskResolver.calculateHref<br/>→ urlRewriter.getReverse<br/>→ url.getServiceUrl"]
    Build -- "нет" --> ByPageId["getHrefByPageId:<br/>maskResolver.calculateQueryHref<br/>→ url.getRealUrl(state)"]
    NavState --> State["state, href"]
    ByPageId --> State
    State --> CheckPageId["maskResolver.calculateUrlParams<br/>('page/:pageId') → isNotPageIdChanged"]
    CheckPageId --> Blank{"isBlank?"}
    Blank -- "да" --> Win["window.open(href, '_blank')"]
    Blank -- "нет" --> Redirect{"redirect?"}
    Redirect -- "да" --> LocHref["window.location.href = href"]
    Redirect -- "нет" --> PushState{"pushState?"}
    PushState -- "да" --> NavPush["Router.navigatePushState<br/>({state, href})"]
    PushState -- "нет" --> Force{"forceReload?"}
    Force -- "да" --> Reload["NavigationLoader.forceReload()"]
    Reload --> Nav
    Force -- "нет" --> Nav["Router.navigate<br/>({state, href}, callback)"]
    Nav --> Diagram3["см. Диаграмму 3"]
```

## 5. Переход по кнопкам браузера «назад/вперёд» (popstate)

Источник: `Router/_private/Router/InitOnPopState.ts`, `Router/_private/History.ts` (`back`/`forward`).

```mermaid
flowchart TD
    Start(["window.onpopstate"]) --> Check{"event.state<br/>валиден?"}
    Check -- "нет" --> Exit(["выход"])
    Check -- "да" --> Cur["history.getCurrentState()"]
    Cur --> Prev["history.getPrevState()<br/>history.getNextState()"]
    Prev --> Dir{"назад или вперёд?"}
    Dir -- "назад" --> NavBack["Router.navigate(state,<br/>() => history.back(state))"]
    Dir -- "вперёд" --> NavFwd["Router.navigate(state,<br/>() => history.forward(state),<br/>errback)"]
    NavBack --> Diagram3["см. Диаграмму 3"]
    NavFwd --> Diagram3
```

## 6. Переход без новой записи в истории (`Router.replaceState`)

Источник: `Router/_private/Router/Router.ts` (`replaceState`), `Router/_private/History.ts` (`replaceState`).

```mermaid
flowchart TD
    Start(["Router.replaceState<br/>(newState, callback?)"]) --> Rew["urlRewriter.get<br/>(newState.state)"]
    Rew --> Pretty["urlRewriter.getReverse<br/>+ url.getRealUrl"]
    Pretty --> Nav["Router.navigate(...) →<br/>history.replaceState(rewrittenState)<br/>(замена текущей записи,<br/>без window.history.pushState)"]
    Nav --> Done(["URL обновлён,<br/>запись в истории не добавлена"])
```

## 7. Смена URL без перестроения страницы

Источник: `Router/_private/Router/Router.ts` (`navigatePushState`, `navigateReplaceState`).

```mermaid
flowchart TD
    Start(["Router.navigatePushState /<br/>navigateReplaceState<br/>(newState)"]) --> Before["_manager.callBeforeUrlChange<br/>(актуализация Route)"]
    Before --> Which{"какой метод?"}
    Which -- "navigatePushState" --> Push["history.push(newState)"]
    Which -- "navigateReplaceState" --> Replace["history.replaceState(newState)"]
    Push --> Done(["URL/история обновлены,<br/>страница НЕ пересобирается"])
    Replace --> Done
```

## 8. Инициализация роутера / разбор начального URL

Источник: `Router/_private/Router/Router.ts` (`getRootRouter`, `createNewRouter`, `_createRouter`),
`Router/_private/History.ts` (`_initHistory`).

```mermaid
flowchart TD
    Start(["getRootRouter() /<br/>createNewRouter(initialUri)"]) --> Store{"rootRouter<br/>есть в Store?"}
    Store -- "да" --> Return(["вернуть инстанс"])
    Store -- "нет" --> Create["_createRouter"]
    Create --> Rew["UrlRewriter.getInstance()<br/>router.json + CustomRouterJson"]
    Rew --> Url["new RouterUrl(location, rewriter)"]
    Url --> Mask["new MaskResolver(rewriter, routerUrl)"]
    Mask --> Hist["new History(rewriter, routerUrl,<br/>windowHistory)"]
    Hist --> Init["History._initHistory:<br/>urlRewriter.get(url.getLogicUrl())<br/>window.history.replaceState"]
    Init --> Return
```

---

# Блок B. Серверные процессы (SSR)

## 9. Построение страницы на сервере по URL

Источник: `Router/ServerRouting.ts` (`getPageSource`),
`Router/_ServerRouting/PageSourceData.ts`, `Router/_ServerRouting/ModuleLoader.ts`,
`Router/_ServerRouting/PageSource.ts`, `Router/_private/MaskResolver.ts`
(`extractS3modFromUrl`, `getAppNameByUrl`).

```mermaid
flowchart TD
    Start(["ServerRouting.getPageSource<br/>(options, request)"]) --> Data["PageSourceData.getResult"]
    Data --> ModuleName["extractS3modFromUrl(url)<br/>getAppNameByUrl(url)<br/>getAppAliasByUrl(url)"]
    ModuleName --> Load["ModuleLoader.load<br/>(Index / Index.server, RSC)"]
    Load --> Found{"модуль найден?"}
    Found -- "нет" --> NotFound(["404 / onNotFoundHandler"])
    Found -- "да" --> Render["PageSource.render →<br/>renderPageSource"]
    Render --> Partial["sendPartialHtml<br/>enablePartialSend /<br/>disablePartialSend"]
    Partial --> Html["getPageRenderer().render<br/>(построение HTML)"]
    Html --> Done(["onSuccessHandler(html)"])
```

## 10. Отправка частичного HTML при сборе зависимостей страницы

`UICommon/Deps:addPageDeps` (модуль `UICommon/_deps/PageDependencies.ts`) в процессе построения
страницы накапливает зависимости. При превышении лимита `SEND_DEPS_LIMIT = 10` вызывает
`sendPartialHtml`, который форвардит в `Router/ServerRouting.sendPartialHtml`
(`UICommon/_deps/partialRender.ts` → `Router/_ServerRouting/ResponseWrapper.ts`).

```mermaid
flowchart TD
    Start(["UICommon/Deps:addPageDeps(modules)"]) --> Client{"клиент (window)?"}
    Client -- "да" --> Exit(["выход (метод актуален только на СП)"])
    Client -- "нет" --> Push["pageDeps += modules<br/>(store PageDependencies)"]
    Push --> Limit{"pageDeps.length<br/>> SEND_DEPS_LIMIT (10)?"}
    Limit -- "нет" --> Done(["зависимости накоплены"])
    Limit -- "да" --> Send["sendPartialHtml()<br/>(UICommon/_deps/partialRender)"]
    Send --> Server["Router/ServerRouting.sendPartialHtml()<br/>(ResponseWrapper)"]
    Server --> Done
```

## Сноска

Deprecated-обёртки `Controller.navigate`/`replaceState`, `Data`, `History`, `MaskResolver`,
`UrlRewriter` (`Router/_private/_deprecated/*`) лишь форвардят вызовы в `getRootRouter()` и
покрываются схемами 3 и 6.
