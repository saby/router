/**
 * @enum PageSourceStatus Внутренние статусы генерации HTML кода страницы.
 */
export enum PageSourceStatus {
    OK, // все хорошо
    NOT_FOUND, // искомый модуль не найден
    ERROR,
}

/**
 * @private
 * @param status    Внутренний статус генерации HTML
 * @param html      HTML код страницы
 */
export interface IPageSourceOK {
    status: PageSourceStatus.OK;
    html: string;
}

/**
 * @private
 * @param status    Внутренний статус генерации HTML
 * @param error     Ошибка, которая возникла при генерации HTML
 */
export interface IPageSourceNotFound {
    status: PageSourceStatus.NOT_FOUND;
    error: Error;
}

/**
 * @private
 * @param status    Внутренний статус генерации HTML
 * @param error     Ошибка, которая возникла при генерации HTML
 */
export interface IPageSourceError {
    status: PageSourceStatus.ERROR;
    error: Error;
}

/**
 * Комплексный тип, описывающий состояние процесса генерации html-кода страницы
 */
export type TPageSource = IPageSourceOK | IPageSourceNotFound | IPageSourceError;
