import Integrations from './classes/Integrations';
import noOpPromise from './classes/NoOpPromise';
import Organizations from './classes/Organizations';
import AccessorPromise from './classes/AccessorPromise';
import Tasks from './classes/Tasks';
import Users from './classes/Users';
import { AnyFunction, Credentials } from './types';
import Labels from './classes/Labels';

export interface CacheBase {
  terminal: {
    completionCallback?: AnyFunction | null;
    [key: string]: any;
  };
  requests: {
    [key: string]: unknown;
  };
  [key: string | symbol]: unknown;
}

export interface FunctionalCache {
  (...args: any[]): void;
}

export interface Cache {
  get: (key: string) => any;
  set: (key: string, value: any) => void;
  [Symbol.toPrimitive]: FunctionalCache;
  [key: string | symbol]: any;
}

export interface ModelAccessor {
  root: ClientInterface;
  uuid: string;
  routePath: string;
  model: any;
  parent?: ModelAccessor;
  select(uuid: string): this;
  fetch?: Skippable;
  delete?: () => void;
  getPath: (uuid?: string) => string;
  functionally: (data: any) => () => any;
  thunk: (data?: any) => this;
  noOp: (data?: any) => this;
  once: () => Partial<this>;
  doNextCallOnce: boolean;
  setOnCreate: (setter: () => unknown) => this;
  onCreate: AnyFunction;
  doNextActionOnce: boolean;
  current: any;
  cache: any; //Cache class which uses Cache/CacheBase
  process: () => this;
  storedPromise: AccessorPromise;
  from: (...args: any[]) => AccessorPromise;
  typedList: ModelInstance[];
  // then: (...args: any[]) => Promise<any>;
}

export interface ModelInstance {
  uuid: string;
  routePath: string;
  accessor?: ModelAccessor;
  select(uuid: string): this;
  refetch?: () => Promise<ModelAccessor | undefined>;
  delete: () => void;
  update: (data: any) => Promise<this>;
  getPath: () => string;
}

export interface ClientInterface {
  tasks: Tasks;
  labels: Labels;
  credentuals?: Credentials;
  authentication: {
    token: string | null;
    authenticated: boolean;
  };
  auth?: {
    token: string | null;
    authenticated: boolean;
  };
  willStoreNextResult: boolean;
  activeOrganizationUuid?: string;
  isBlocking: boolean;
  // await: () => this;
  cache: any; //Cache class which uses Cache/CacheBase
}

export interface Skippable {
  (): AccessorPromise | noOpPromise;
  skip?: boolean;
  willSkip?: boolean;
  cache?: unknown;
}
