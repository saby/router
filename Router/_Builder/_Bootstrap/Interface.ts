/// <amd-module name="Router/_Builder/_Bootstrap/Interface" />

/**
 * @interface IFullData - данные для построения полной страницы
 * @property {string} HeadAPIData         - данные из HeadAPI. Строка вида HTML.
 * @property {string} BodyAPIClasses      - данные из BodyAPI. Строка с классами для <body>.
 * @property {string} JSLinksAPIBaseData  - данные из JSLinksAPI, но с базовыми скриптами. Строка вида HTML.
 * @property {string} JSLinksAPIData      - данные из JSLinksAPI со всеми остальными скриптами. Строка вида HTML.
 * @property {string[]} requiredModules   - массив с именами доп. зависимостей. Они нужны непосредственно для старта.
 * @property {string} controlsHTML        - стррока вида HTML с версткой контролов, полученная на первом шаге.
 */
export interface IFullData {
   HeadAPIData: string;
   BodyAPIClasses: string;
   JSLinksAPIBaseData: string;
   JSLinksAPIData: string;
   JSLinksAPITimeTesterData: string;

   requiredModules: string[];
   controlsHTML: string;

   // поля при генерации статичной странички в билдере
   builderOptions?: IBuilderOptions;
   isCanceledRevive?: boolean;
}

/**
 * @interface IRenderOptions
 * @property {boolean} bootstrapWrapperMode - флаг, который говорит компоненту SbisEnvUI.Bootstrap строить только контент
 * @property {object} pageConfig - поле, в котором будут лежать предзагруженные данные для построения страницы
 * @property {boolean} isCanceledRevive - отмена оживления страницы на клиенте
 */
export interface IRenderOptions {
   appRoot: string;
   wsRoot: string;
   resourceRoot: string;
   cdnRoot?: string;
   staticDomains: string[];
   logLevel?: string;
   servicesPath: string;
   buildnumber?: string;
   product?: string;
   pageName?: string;
   theme?: string;
   RUMEnabled?: boolean;
   bootstrapWrapperMode?: boolean;
   application?: string;
   pageConfig: { title?: string } | false;
   _options?: IBuilderOptions;
   isCanceledRevive?: boolean;
}

// поля при генерации статичной странички в билдере
export interface IBuilderOptions {
   builder: string;
   builderCompatible: boolean;
   dependencies: string[];
}

export interface ICollectedDeps {
   // готовые ссылки на js
   scripts: string[];
   // названия js модулей
   js: string[];
   css: {
      simpleCss: string[];
      themedCss: string[];
   };
   tmpl: string[];
   wml: string[];
   rsSerialized: string;
   rtpackModuleNames: string[];
   additionalDeps: string[];
}

export interface IDataAggregatorModule {
   execute(deps: ICollectedDeps, options?: IRenderOptions): Partial<IFullData> | null;
}
