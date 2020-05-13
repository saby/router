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
        query.split('&').forEach(item => {
            this.query.push(item);
        });
    }

    replaceQuery(search: string, replace: string): void {
        const searchItems = search.split('&');
        const replaceItems = replace.split('&');
        let position;
        for (let i = 0; i < this.query.length; i++) {
            if (this.query[i] === searchItems[0]) {
                position = i;
                break;
            }
        }
        this.query.splice(position, searchItems.length, ...replaceItems);
    }

    removeQuery(query: string): void {
        const queryItems = query.split('&');
        this.query = this.query.filter(item => queryItems.indexOf(item) === -1 );
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
