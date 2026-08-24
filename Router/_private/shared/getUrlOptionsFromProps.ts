import { IRouteProps } from './IRouteProps';

export function getUrlOptionsFromProps(
    props: IRouteProps & Record<string, unknown>,
    urlOptions: object
): object {
    const urlOptionsFromProps: Record<string, unknown> = {};
    for (const i in props) {
        if (props.hasOwnProperty(i) && !isRestrictedProp(i) && !urlOptions.hasOwnProperty(i)) {
            urlOptionsFromProps[i] = props[i];
        }
    }
    return urlOptionsFromProps;
}

const FILTERED_OPTIONS_NAMES: string[] = [
    'content',
    'mask',
    'theme',
    '_isSeparatedOptions',
    '_logicParent',
    'readOnly',
    'children',
    'getDataToRender',
];

function isRestrictedProp(optionName: string): boolean {
    return FILTERED_OPTIONS_NAMES.indexOf(optionName) >= 0;
}
