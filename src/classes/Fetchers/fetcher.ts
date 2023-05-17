// import { store } from '@store';

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
  clonedResponse: unknown;
  responseBody: unknown;
}

type RequestCallback = (requestCallData: RequestCallData) => unknown;

export const CreateFetcher = () => {
  const callbacks = [] as RequestCallback[];
  const request = async ({ url, body, query, headers, method }: Request) => {
    // const { accessToken } = store.getState().auth;
    const newQuery = query || {};
    const extendedHeaders = {
      ...{
        'Content-Type': 'application/json'
        // Authorization: accessToken ? `Bearer ${accessToken}` : '',
      },
      ...headers
    };

    const queryParams = new URLSearchParams(newQuery).toString();
    const response = await fetch('/api/trpc', {
      method,
      headers: extendedHeaders,
      body: body ? JSON.stringify(body) : undefined
    });

    const clonedResponse = response.clone();
    const clonedResponseForBody = response.clone();
    const responseBody = await clonedResponseForBody.json();
    console.log('RESPONSE BODY', responseBody);
    console.log(clonedResponse);
    callbacks.forEach(callback =>
      callback({
        url,
        body,
        query,
        headers: extendedHeaders,
        method,
        response,
        clonedResponse,
        responseBody
      })
    );

    return responseBody;
  };

  return {
    get: async (url: string, query?: object, override?: Partial<Request>) =>
      request({
        url,
        query: query as Record<string, string>,
        method: 'GET',
        ...override
      }),
    post: async (url: string, body?: object, override?: Partial<Request>) =>
      request({ url, body, method: 'POST', ...override }),
    delete: async (url: string, override?: Partial<Request>) =>
      request({ url, method: 'DELETE', ...override }),
    put: async (url: string, body?: object, override?: Partial<Request>) =>
      request({ url, body, method: 'PUT', ...override }),
    callbacks,
    addCallback: (callback: RequestCallback) => {
      callbacks.push(callback);
    }
  };
};

export default CreateFetcher();
