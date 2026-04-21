/**
 * Внутренние статусы генерации HTML кода страницы.
 */
export enum PageSourceStatus {
    OK, // все хорошо
    NOT_FOUND, // искомый модуль не найден
    ERROR,
}

/**
 * Cостояние процесса генерации html-кода страницы - всё хорошо
 * @private
 */
export interface IPageSourceOK {
    /**
     * Внутренний статус генерации HTML
     */
    status: PageSourceStatus.OK;
    /**
     * HTML код страницы
     */
    html: string;
}

/**
 * Cостояние процесса генерации html-кода страницы - страница не найдена
 * @private
 */
export interface IPageSourceNotFound {
    /**
     * Внутренний статус генерации HTML
     */
    status: PageSourceStatus.NOT_FOUND;
    /**
     * Ошибка, которая возникла при генерации HTML
     */
    error: Error;
}

/**
 * Cостояние процесса генерации html-кода страницы - произошла ошибка
 * @private
 */
export interface IPageSourceError {
    /**
     * Внутренний статус генерации HTML
     */
    status: PageSourceStatus.ERROR;
    /**
     * Ошибка, которая возникла при генерации HTML
     */
    error: Error;
}

/**
 * Комплексный тип, описывающий состояние процесса генерации html-кода страницы
 */
export type TPageSource = IPageSourceOK | IPageSourceNotFound | IPageSourceError;
