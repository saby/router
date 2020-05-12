const REG_PATH = /^([^\?\#\s]+)/;
const REG_QUERY = /\?([^#]+)/;
const REG_HASH = /\#(.+)$/;

export default class UrlModifirer {
    private path: string;
    private query: string[];
    private hash: string;
    constructor(url: string) {
        this.path = REG_PATH.exec(url)[0];

        let match = REG_QUERY.exec(url);
        this.query = match !== null ? match[1].split('&') : [];

        match = REG_HASH.exec(url);
        this.hash = match !== null ? match[1] : '';
    }

    add(path: string): void {
        this.path += '/' + path;
    }

    replace(search: string, path: string): void {
        this.path = this.path.replace(search, path);
    }

    addQuery(query: string): void {
        this.query.push(query);
    }

    replaceQuery(search: string, replace: string): void {
        for (let i = 0; i < this.query.length; i++) {
            if (this.query[i] === search) {
                this.query[i] = replace;
                return;
            }
        }
    }

    removeQuery(query: string): void {
        this.query = this.query.filter(item => item !== query);
    }

    generate(): string {
        let url = this.path.replace(/(\/)+/g, '/');
        if (this.query.length > 0) {
            url += `?${this.query.join('&')}`;
        }
        if (this.hash.length > 0) {
            url += `#${this.hash}`;
        }
        return url;
    }
}
