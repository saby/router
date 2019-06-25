import * as Control from 'Core/Control';
import * as template from 'wml!RouterDemo/ListRouter';

interface IListItem {
    itemUrlName: string;
    personName: string;
    personAge: number;
}

class ListRouter extends Control {
    protected _template: Function = template;

    private _items: IListItem[] = [
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
    private _displayProperty: string = 'personName';
}

export = ListRouter;
