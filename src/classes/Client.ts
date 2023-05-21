import cache, { Cache } from '@sdk-client/cache';
import { ClientInterface } from '@sdk-client/interfaces';
import { AnyFunction, ConfigProps, Credentials } from '@sdk-client/types';
import fetcher, {
  RequestCallData
} from '@sdk-client/classes/Fetchers/trpcFetcher';
import trpcFetcher from '@sdk-client/classes/Fetchers/trpcFetcher';
import AliasMap from './UtilityClasses/AliasMap';

import BaseModelAccessor from './BaseModelAccessor';
import Tasks from './Tasks';
import Labels from './Labels';

type FilterMethods<T> = {
  [K in keyof T]: T[K] extends BaseModelAccessor<T> ? never : K;
}[keyof T];

type ClientInterfaceProperties = FilterMethods<ClientInterface>;

type MethodReturnTypeMap<T extends keyof Client, M extends keyof Client[T]> = {
  [key in T]: () => ReturnType<Client[key][M]>;
};

export default class Client implements ClientInterface {
  description: string =
    'This is an SDK client instance which interfaces with a task management system';

  tasks: Tasks;

  labels: Labels;

  user?: any;

  organizationUuid?: any;

  preferences?: any;

  authentication: {
    token: string | null;
    authenticated: boolean;
  };

  auth;

  config;

  credentuals?: Credentials;

  willStoreNextResult: boolean;

  activeOrganizationUuid?: string;

  isBlocking: boolean;

  cache: Cache;

  /* Retrieve a value from the cache */
  get = (key: string) => this.cache.get(key);

  set = (key: string, value: unknown) => {
    this.cache.set(key, value);
    return this.cache;
  };

  cacheRequest(data: RequestCallData) {
    this.cache.data.requests[data.url] = data;
  }

  dispatch: AnyFunction;

  static fetcher = trpcFetcher;

  [key: string]: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.tasks = new Tasks(this);
    this.labels = new Labels(this);
    this.authentication = {
      token: null,
      authenticated: false
    };
    this.auth = this.authentication;
    this.config = this.authentication;
    this.willStoreNextResult = false;
    this.isBlocking = false;
    this.cache = cache;
    // this.last = () => cache.last;
    this.activeOrganizationUuid = '';
    this.dispatch = () => {};
    this.set('requests', {});
    fetcher.addCallback(
      ({
        url,
        body,
        query,
        headers,
        method,
        response,
        responseBody
      }: RequestCallData) => {
        this.cacheRequest({
          url,
          body,
          query,
          headers,
          method,
          response,
          responseBody
        });
        console.log('stored', response);
      }
    );
    this.list = this.shorthandAlias('list', 'plural');
    this.first = this.shorthandAlias('first', 'singular');
    this.create = this.shorthandAlias('create', 'singular', ['name']);
    this.delete = this.shorthandAlias('delete', 'singular', ['id']);
  }

  reconstruct = Client.constructor;

  configure = ({
    email,
    password,
    dispatchLogin,
    isLoggedIn,
    user,
    organization,
    settings,
    accessToken
  }: ConfigProps): typeof this => {
    if (isLoggedIn) this.authentication.authenticated = true;
    if (accessToken) this.authentication.token = accessToken;
    if (organization) {
      this.activeOrganization = organization;
      this.organizations.select(organization);
    }
    if (!isLoggedIn && email && password)
      this.login(email, password, dispatchLogin);
    if (user) {
      this.user = user;
      this.users.current = user;
    }
    if (user && settings) this.users.current.settings = settings;
    if (organization) this.organizations.current = organization;
    return this;
  };

  log = () => {
    console.log(this);
    return this;
  };

  persist = () => {
    this.willStoreNextResult = true;
    return this;
  };

  sequential = () => {
    this.isBlocking = true;
    return this;
  };

  functionally = (data: any) => {
    // nice name, not sure what I wanted it for
    return this;
  };

  thunk = (data: any) => {
    // do a thunk
    return this;
  };

  reset = () => {
    this.reconstruct();
    return this;
  };

  print = (text: string) => {
    console.log(text);
    return this;
  };

  get models(): Record<string, any> {
    const models: Record<string, any> = {};
    Object.entries(this).forEach(([k, value]) => {
      if (value instanceof BaseModelAccessor) models[k] = value;
    });
    return models;
  }

  get modelKeys(): string[] {
    return Object.keys(this.models);
  }

  modelNames(singular = false): string[] {
    const names = Object.keys(this.models);
    return singular ? names.map(name => name.slice(0, -1)) : names;
  }

  login = async (
    email: string,
    password: string,
    dispatchLogin: ((token: string) => any) | undefined
  ) => {
    const endpointUrl = '/auth/tokens';
    return fetcher
      .post(endpointUrl, { method: 'standard', payload: { email, password } })
      .then((res: any) => {
        this.authentication = {
          ...this.authentication,
          token: res.data.accessToken,
          authenticated: true
        };
        if (dispatchLogin) dispatchLogin(res.data.accessToken);
        return res;
      });
  };

  shorthandAlias = <T extends keyof Client, M extends keyof Client[T]>(
    method: M,
    plurality = 'plural',
    expectedArgs: string[] = [],
    models?: T[]
  ): MethodReturnTypeMap<T, M> => {
    if (!models) models = this.modelNames(plurality === 'singular') as T[];
    const aliasMap = models.reduce((acc, key) => {
      const propName = plurality == 'singular' ? `${key}s` : key;
      acc[key] =
        expectedArgs.length > 0
          ? (...expectedArgs: any[]) =>
              this[propName][method](...expectedArgs) as ReturnType<
                Client[T][typeof method]
              >
          : (...args: any[]) => this[propName][method](...args);
      acc[key];
      return acc;
    }, new AliasMap<M>(method as string));
    return aliasMap as MethodReturnTypeMap<T, M>;
  };

  last = {
    organization: (...args: any[]) => this.organizations.last(...args),
    integration: (...args: any[]) => this.integrations.last(...args),
    user: (...args: any[]) => this.users.last(...args),
    event: (...args: any[]) => this.events.last(...args),
    task: (...args: any[]) => this.tasks.last(...args)
  };

  some = {
    organizations: (...args: any[]) => this.organizations.some(3, ...args),
    integrations: (...args: any[]) => this.integrations.some(3, ...args),
    users: (...args: any[]) => this.users.some(3, ...args),
    events: (...args: any[]) => this.events.some(3, ...args),
    tasks: (...args: any[]) => this.tasks.some(3, ...args)
  };

  one = this.first;
}
