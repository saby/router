const REG_PATH = /^([^\?\#\s]+)/;
const REG_QUERY = /\?([^#]+)/;
const REG_HASH = /\#(.+)$/;

export default class UrlModifirer {
    private path: string;
    /**
     * @todo Если будем усложнять логику,
     *  то необходимо преваращть в класс и уже целиком парсить query.
     */
    private query: string;
    private hash: string;
    constructor(url: string) {
        this.path = REG_PATH.exec(url)[0];

        let match = REG_QUERY.exec(url);
        this.query = match !== null ? match[1] : '';

        match = REG_HASH.exec(url);
        this.hash = match !== null ? match[1] : '';
    }

    add(path: string): void {
        this.path += path;
    }

    replace(search: string, path: string): void {
        this.path = this.path.replace(search, path);
    }

    addQuery(query: string): void {
        if (this.query.length > 0) {
            this.query += '&';
        }
        this.query += query;
    }

    removeQuery(query: string): void {
        const pos = this.query.indexOf(query);
        if (pos === 0) {
            this.query = this.query.slice(query.length);
            return;
        }
        this.query.replace(`&${query}`, '');
    }

    generate(): string {
        let url = this.path;
        if (this.path[this.path.length - 1] !== '/') {
            url += '/';
        }
        if (this.query.length > 0) {
            url += `?${this.query}`;
        }
        if (this.hash.length > 0) {
            url += `#${this.hash}`;
        }
        return url;
    }
}
