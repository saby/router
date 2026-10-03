import { IBuilderOptions } from '../../Interface';
import { getStaticDependenciesString } from './shared';

/**
 * Возвращает стартовые скрипты для статичных страниц, которые создает builder из файлов name.html.tmpl
 */
export function getStaticPageStartScript(builderOptions: IBuilderOptions | undefined): string {
    if (!builderOptions) {
        return '';
    }

    if (builderOptions.builderCompatible) {
        throw new Error(
            'Обнаружено некорректное использование шаблона статичной страницы. ' +
                'Нельзя строить статичную страницу в режиме совместимости ("compatible" = true)!'
        );
    }

    const dependencies = getStaticDependenciesString(builderOptions.dependencies);

    return `<script>
window.receivedStates = '{"ThemesController": {"themes" : {"' + (window.defaultStaticTheme || 'default') + '": true}}}';
window.addEventListener('load', function () {
   /* Шаблоны старой кодогенерации зависят от UI/Executor, новой - от Compiler/IR */
   require(['UICore/Base', 'Application/Initializer', 'Application/Env', 'SbisUI/Compatible',
            'Application/State', 'UI/State', 'Router/router', 'UI/Executor', 'Compiler/IR'],
      function(UICore, AppInitializer, AppEnv, Compatible, AppState, UIState, router){
         /*Первый шаг - старт Application, иницализация core и темы. Второй шаг - загрузка ресурсов*/
         AppInitializer.default(window.wsConfig, new AppEnv.EnvBrowser(window['wsConfig']),
                                new AppState.StateReceiver(UIState.Serializer));
         Compatible.AppInit();

         require(['WasabyLoader/ModulesLoader',${dependencies}], function(ModulesLoader){ModulesLoader.initWarmup();
            var templateFn = ${builderOptions.builder};
            templateFn.stable = true;
            var cnt = UICore.Control.extend({
               _template: templateFn
            });
            cnt.defaultProps = {
               notLoadThemes: true
            };
            Compatible.AppStart._shouldStart = false;
            var domElement = UICore.selectRenderDomNode(document.getElementById('wasaby-content'));
            var Router = router.getRootRouter();
            Compatible.AppStart.createControl(cnt, { Router: Router }, domElement);
            ModulesLoader.initWarmup();
         });
      }
   );
});
      </script>`;
}
