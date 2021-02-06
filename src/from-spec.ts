export type Path = {
    post: {
        paramaters?: {
            query: any;
        };
        responses: any;
        requestBody?: {
            content: {
                'application/json': any;
            };
        };
    };
};

type account = {
    post: {
        parameters: {
            query: {
                userId?: string | null;
                code?: string | null;
            };
        };
        responses: {
            /** Success */
            200: unknown;
        };
        requestBody: {
            content: {
                'application/json-patch+json': Date;
                'application/json': Date;
                'text/json': Date;
                'application/*+json': Date;
            };
        };
    };
};

type asd = {
    post: {
        parameters: {
            query: {
                userId?: string | null;
                code?: string | null;
            };
        };
        responses: Date;
        requestBody: {
            content: {
                'application/json-patch+json': Date;
                'application/json': Date;
                'text/json': Date;
                'application/*+json': Date;
            };
        };
    };
};

type spec = {
    '/accounts': account;
    '/asd': asd;
};

export type Paths<T> = Record<keyof T, Path>;

type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

export default function fromSpec<T extends Paths<T>>() {
    return function bla<Key extends keyof T>(): Paths<T>[Key] {
        return (undefined as unknown) as Paths<T>[Key];
    };
}

const q = fromSpec<spec>();

const p = q<'/accounts'>();

p.post.responses;
