import * as Control from 'Core/Control';
import * as template from 'wml!RouterDemo/ListRouter';

/**
 * Пример использования Router.router:List
 * для изменения URL, когда дочерний "List Control" вызывает событие @event #itemClick
 * @author Санников К.А.
 */

interface IListItem {
    itemUrlName: string;
    personName: string;
    personAge: number;
}

class ListRouter extends Control {
    protected _template: Function = template;

    protected _items: IListItem[] = [
        {
            itemUrlName: 'fred-bloggs',
            personName: 'Fred Bloggs',
            personAge: 54
        },
        {
            itemUrlName: 'john-doe',
            personName: 'John Doe',
            personAge: 28
        },
        {
            itemUrlName: 'jane-schmoe',
            personName: 'Jane Schmoe',
            personAge: 37
        },
        {
            itemUrlName: 'jack-smith',
            personName: 'Jack Smith',
            personAge: 41
        }
    ];
    protected _displayProperty: string = 'personName';
}

export = ListRouter;
