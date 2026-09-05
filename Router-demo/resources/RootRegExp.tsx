/**
 * @author Мустафин Л.И.
 */

import { Reference } from 'Router/router';

/**
 * Опции компонента RootRegExp
 * @private
 */
export interface IRootRegExpProps {
    /**
     * Значение параметра docId из URL-адреса
     */
    docId?: string;
}

/**
 * Демонстрация регулярного выражения в router.json
 * @private
 */
export default function RootRegExp(props: IRootRegExpProps): JSX.Element {
    const docId = props.docId || '';

    return (
        <div>
            <h1>Демонстрация регулярного выражения в router.json</h1>
            <p>При необходимости в router.json можно использовать регулярные выражения.</p>
            <p className="CodeSpan">
                ...
                <br />
                &quot;{'/regex:^([0-9]{6})$'}&quot;: &quot;Router-demo/doc/$1&quot;
                <br />
                ...
            </p>
            <p>
                Кликая по списку ниже меняется значение параметра{' '}
                <span className="CodeSpan">docId</span>.
            </p>
            <ul>
                <li>
                    <Reference state="/Router-demo/:docId" docId="987654">
                        <a>docId=987654</a>
                    </Reference>
                </li>
                <li>
                    <Reference state="/Router-demo/:docId" docId="654321">
                        <a>docId=654321</a>
                    </Reference>
                </li>
            </ul>
            <p>
                Вычислено значение маски <span className="CodeSpan">{'/regex:^([0-9]{6})$'}</span>:{' '}
                {docId}
            </p>

            <br />
            <p>
                Здесь можно использовать &quot;любые&quot; регулярные выражения, учитывая некоторые
                особенности:
            </p>
            <ul>
                <li>перед регулярным выражением необходимо указать строку &quot;regex:&quot;;</li>
                <li>
                    регулярные выражения имеет смысл использовать только, если есть динамичная часть
                    в корне приложения/сервиса, т.к. в остальных сценариях можно обойтись без них;
                </li>
                <li>
                    регулярное выражение следует задавать наиболее точно соответствующим вашим
                    данным, иначе могут быть ложные &quot;соответствия&quot;;
                </li>
                <li>
                    в регулярном выражении необходимо использовать &quot;захватывающие скобки&quot;,
                    а в значении замены должен быть идентификатор ($1 - нумерация начинается с 1)
                    &quot;захваченной строки&quot;.
                    <br />
                    Это нужно, чтобы соответствующее регулярному выражению значение было добавлено в
                    итоговый URL;
                </li>
                <li>
                    использование неоптимальных регулярных выражений может привести к замедлению
                    разбора маршрутов;
                </li>
            </ul>
        </div>
    );
}
