interface Request {
  url: string;
  method: string;
  body?: object;
  headers?: object;
  // onCompleted?: (data: unknown) => void;
  // onError?: (error: unknown) => void;
  query?: Record<string, string>;
}

export interface RequestCallData extends Request {
  response: unknown;
  responseBody: unknown;
}

type RequestCallback = (requestCallData: RequestCallData) => unknown;

export class trpcFetcher {
  routeMap: Record<string, (...args: any) => Promise<any>> = {};
  restMap = this.routeMap;

  client: any;

  constructor(routeMap?: Record<string, (...args: any) => Promise<any>>) {
    this.routeMap = { ...this.routeMap, ...routeMap };
  }

  configure({ routeMap }: Partial<trpcFetcher>) {
    this.routeMap = { ...this.routeMap, ...routeMap };
  }

  request = async ({ url, body, query, headers, method }: Request) => {
    const fetch = this.routeMap[url];
    const newQuery = query || {};

    const queryParams = new URLSearchParams(newQuery).toString();
    const response = await fetch();
    const responseBody = response;
    this.callbacks.forEach(callback =>
      callback({
        url,
        body,
        query,
        method,
        response,
        responseBody
      })
    );

    return responseBody;
  };

  get = async (url: string, query?: object, override?: Partial<Request>) =>
    this.request({
      url,
      query: query as Record<string, string>,
      method: 'GET',
      ...override
    });

  post = async (url: string, body?: object, override?: Partial<Request>) =>
    this.request({ url, body, method: 'POST', ...override });

  delete = async (url: string, override?: Partial<Request>) =>
    this.request({ url, method: 'DELETE', ...override });

  put = async (url: string, body?: object, override?: Partial<Request>) =>
    this.request({ url, body, method: 'PUT', ...override });

  callbacks: RequestCallback[] = [];

  addCallback = (callback: RequestCallback) => {
    this.callbacks.push(callback);
  };
}
export const CreateFetcher = () => {};

const fetcher = new trpcFetcher();

export default fetcher;
