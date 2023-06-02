/**
 * Одно состояние в истории браузера.
 * @interface Router/_private/IHistoryState
 * @public
 * @author Мустафин Л.И.
 */
export interface IHistoryState {
    /**
     * @cfg {Number} Числовой идентификатор текущего состояния.
     */
    id?: number;
    /**
     * @cfg {String} Действительный адрес, с которым работает роутинг.
     */
    state: string;
    /**
     * @cfg {String} "Красивый" адрес, который отображается пользователю.
     */
    href?: string;
}

export type TStateChangeFunction = (
    newLoc: IHistoryState,
    oldLoc: IHistoryState
) => Promise<boolean> | boolean;

export interface IRegisterableComponent {
    getInstanceId: () => string;
}

export interface IRegisteredRoute {
    beforeUrlChangeCb: TStateChangeFunction;
    afterUrlChangeCb: TStateChangeFunction;
}

export interface IRegisteredReference {
    afterUrlChangeCb: TStateChangeFunction;
}
