/**
 * Библиотека-реализация по умолчанию фичи (feature_required) CustomRouterJson
 * @library
 * @private
 * @author Мустафин Л.И.
 * @module
 */

/**
 * Интерфейс router.json файла
 * @private
 */
interface IRouterJson {
    [key: string]: string;
}

/**
 * Метод получения "кастомного" router.json
 * Результат этого метода будет использован совместно с router.json сервиса
 * - сначала этот "кастомный" router.json, потом router.json
 * По умолчанию "кастомного" router.json нет
 * @private
 */
function get(): IRouterJson | void {}

export { get, IRouterJson };
