/// <amd-module name="Router/_private/URLParser" />

type TType = 'mark'|'part'|'hash';
type TMarkKind = 'root'|'query'|'hash';
type TPartKind = 'main'|'main-param'|'query'|'query-param';

interface INode {
    type: TType;
    kind?: string;
    name?: string;
    value?: string;
    next?: INode;
}

interface IMarkNode extends INode {
    type: 'mark';
    kind: TMarkKind;
}
function isMarkNode(n: INode): n is IMarkNode {
    return n && n.type === 'mark';
}

interface IPartNode extends INode {
    type: 'part';
}
function isPartNode(n: INode): n is IPartNode {
    return n && n.type === 'part';
}

interface IMainPartNode extends IPartNode {
    kind: 'main'|'main-param';
    value: string;
}
function isMainPartNode(n: INode): n is IMainPartNode {
    return isPartNode(n) && (n.kind === 'main' || n.kind === 'main-param');
}

interface IQueryPartNode extends IPartNode {
    kind: 'query'|'query-param';
    name: string;
    value: string;
}
function isQueryPartNode(n: INode): n is IQueryPartNode {
    return isPartNode(n) && (n.kind === 'query' || n.kind === 'query-param');
}

function isParamPartNode(n: INode): boolean {
    return isPartNode(n) && (n.kind === 'main-param' || n.kind === 'query-param');
}

interface IHashNode extends INode {
    type: 'hash';
    value: string;
}
function isHashNode(n: INode): n is IHashNode {
    return n && n.type === 'hash';
}

type TState = 'start'|'main-part'|'query-part'|'hash'|'end'|'fail';
type TStateFunction = (char: string) => TState;

type TParseMode = 'url'|'mask';

const PARSE_END_SIGNAL: string = 'parse end';

export default class URLParser {
    private _buffer: string;
    private _bufferLen: number;
    private _tempBuffer: string;
    private _pos: number;
    private _state: TState;

    private _head: INode;
    private _tail: INode;
    private _transitions: Record<TState, TStateFunction>;

    constructor() {
        this._transitions = {
            start: this._hdlStart.bind(this),
            'main-part': this._hdlMainPart.bind(this),
            'query-part': this._hdlQueryPart.bind(this),
            hash: this._hdlHash.bind(this),
            end: null,
            fail: null
        };
    }

    parse(url: string, mode: TParseMode = 'url'): INode {
        this._head = null;
        this._tail = null;
        this._state = 'start';
        this._tempBuffer = '';

        this._buffer = url;
        this._bufferLen = url.length;
        this._pos = 0;

        while (this._state !== 'end' && this._state !== 'fail') {
            this._state = this._transitions[this._state](this._buffer[this._pos]);
            if (++this._pos >= this._bufferLen) {
                if (this._transitions[this._state]) {
                    this._transitions[this._state](PARSE_END_SIGNAL);
                }
                this._state = 'end';
            }
        }

        if (mode === 'mask') {
            this._head = this._markParams(this._head);
        }

        return this._head;
    }

    stringify(node: INode): string {
        let n = node;
        let result = '';
        while (n) {
            result += this._nodeToString(n, n.next);
            n = n.next;
        }
        return result;
    }

    flatten(node: INode): INode[] {
        let n = node;
        const result = [];
        while (n) {
            result.push(n);
            n = n.next;
        }
        return result;
    }

    private _nodeToString(n: INode, next: INode): string {
        if (isMarkNode(n)) {
            switch (n.kind) {
            case 'root':
                return '/';
            case 'query':
                return '?';
            case 'hash':
                return '#';
            }
        } else if (isMainPartNode(n)) {
            const prefix = isParamPartNode(n) ? ':' : '';
            const postfix = isMainPartNode(next) ? '/' : '';
            return `${prefix}${n.value}${postfix}`;
        } else if (isQueryPartNode(n)) {
            const prefix = isParamPartNode(n) ? ':' : '';
            const postfix = isQueryPartNode(next) ? '&' : '';
            return `${n.name}=${prefix}${n.value}${postfix}`;
        } else if (isHashNode(n)) {
            return n.value;
        }
        throw new Error(`Unable to convert node ${JSON.stringify(n)} to string`);
    }

    private _emitNode<T extends INode>(node: T): void {
        if (!this._head) {
            this._head = node;
            this._tail = this._head;
        } else {
            this._tail.next = node;
            this._tail = this._tail.next;
        }
    }

    private _markParams(node: INode): INode {
        let n: INode = node;
        while (n) {
            if (isPartNode(n) && n.value && n.value[0] === ':') {
                n.kind = isMainPartNode(n) ? 'main-param' : 'query-param';
                n.value = n.value.slice(1);
            }
            n = n.next;
        }
        return node;
    }

    private _hdlStart(char: string): TState {
        if (char === '/') {
            this._emitNode<IMarkNode>({ type: 'mark', kind: 'root' });
        } else {
            --this._pos;
        }
        return 'main-part';
    }

    private _hdlMainPart(char: string): TState {
        if (char === '/' || char === PARSE_END_SIGNAL) {
            if (this._tempBuffer !== '') {
                this._emitNode<IMainPartNode>({ type: 'part', kind: 'main', value: this._tempBuffer });
                this._tempBuffer = '';
            }
            return 'main-part';
        } else if (char === '?' || char === '#') {
            const isQuery = char === '?';
            if (this._tempBuffer !== '') {
                this._emitNode<IMainPartNode>({ type: 'part', kind: 'main', value: this._tempBuffer });
                this._tempBuffer = '';
            }
            this._emitNode<IMarkNode>({ type: 'mark', kind: isQuery ? 'query' : 'hash' });
            return isQuery ? 'query-part' : 'hash';
        } else {
            this._tempBuffer += char;
            return char === '=' ? 'query-part' : 'main-part';
        }
    }

    private _hdlQueryPart(char: string): TState {
        if (char === '&' || char === '#' || char === PARSE_END_SIGNAL) {
            if (this._tempBuffer !== '') {
                const [name, value]: string[] = this._tempBuffer.split('=', 2);
                this._emitNode<IQueryPartNode>({ type: 'part', kind: 'query', name, value });
                this._tempBuffer = '';
            }
            if (char === '#') {
                this._emitNode<IMarkNode>({ type: 'mark', kind: 'hash' });
                return 'hash';
            }
            return 'query-part';
        } else {
            this._tempBuffer += char;
            return 'query-part';
        }
    }

    private _hdlHash(char: string): TState {
        if (char === PARSE_END_SIGNAL) {
            this._emitNode<IHashNode>({ type: 'hash', value: this._tempBuffer });
            this._tempBuffer = '';
        } else {
            this._tempBuffer += char;
        }
        return 'hash';
    }
}