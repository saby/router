import { Control, TemplateFunction } from 'UI/Base';
import { createNewRouter, IRouter } from 'Router/router';
import template = require('wml!Router-demo/resources/AppInPage');
import 'css!Router-demo/resources/AppInPage';

/**
 * Демонстрация работы Router.router:Route для вставки приложения в приложение
 * @private
 */
export default class AppInPage extends Control {
    protected _template: TemplateFunction = template;
    protected _showRoute: boolean = false;
    protected _newRouter?: IRouter;

    protected _toggleRoute(): void {
        if (!this._showRoute) {
            this._newRouter = createNewRouter('/Router-demo');
        } else {
            delete this._newRouter;
        }
        this._showRoute = !this._showRoute;
    }
}
