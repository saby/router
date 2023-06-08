/**
 * @enum PageSourceStatus Внутренние статусы генерации HTML кода страницы.
 */
export enum PageSourceStatus {
    OK, // все хорошо
    NOT_FOUND, // искомый модуль не найден
}

/**
 * @interface IPageSourceOK Интерфейс для успешной генерации HTML кода страницы
 * @private
 * @param status    Внутренний статус генерации HTML
 * @param html      HTML код страницы
 * @param error     Ошибка, которая возникла при генерации HTML
 */
export interface IPageSourceOK {
    status: PageSourceStatus.OK;
    html: string;
}

/**
 * @interface IPageSourceNotFound Интерфейс при ошибке генерации HTML кода страницы
 * @private
 * @param status    Внутренний статус генерации HTML
 * @param error     Ошибка, которая возникла при генерации HTML
 */
export interface IPageSourceNotFound {
    status: PageSourceStatus.NOT_FOUND;
    error: Error;
}

/**
 * Комплексный тип, описывающий состояние процесса генерации html-кода страницы
 */
export type TPageSource = IPageSourceOK | IPageSourceNotFound;
