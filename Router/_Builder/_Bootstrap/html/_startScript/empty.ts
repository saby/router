import { removePreLoadScript } from './shared';

/*
 * Для определенных сценариев тестирования нужно отключать оживление страницы и убирать класс pre-load:
 * https://online.sbis.ru/opendoc.html?guid=9a741529-db8c-4698-a962-9ab5924e113c
 * Отключать оживление можно через query параметр ?isCanceledRevive=true (вместо true можно подставить любое значение)
 * *
 * Существуют также ситуации, когда и на бою нам не нужен стартовый скрипт. Например, быстрый запрос за данными
 * Актуально для Google Chrome, например
 * https://online.sbis.ru/opendoc.html?guid=9a500336-5855-4d08-9c69-b27a54ff2e37
 */
export function getEmptyStartScript(): string {
    return `<script key="init_script">
        ${removePreLoadScript}
    </script>`;
}
