import cache, { Cache } from '../cache';
import {
  ModelAccessor,
  ModelInstance,
  ClientInterface,
  Skippable
} from '../interfaces';
import { AnyFunction } from '@sdk-client/types';
import { clean, skipped } from '@sdk-client/utils';
import fetcher from '@sdk-client/classes/Fetchers/trpcFetcher';

import BaseModelInstance from './ModelClasses/BaseModelInstance';
import NoOpPromise from './NoOpPromise';
import AccessorPromise from './AccessorPromise';

export default class BaseModelAccessor<T> implements ModelAccessor {
  root: ClientInterface;

  uuid: string;

  routePath: string;

  parent?: ModelAccessor;

  model = BaseModelInstance;

  storable?: unknown;

  willStoreNextResult: boolean;

  doNextCallOnce!: boolean;

  doNextActionOnce: boolean;

  cache: Cache;

  current: any;

  result: any;

  onCreate: (...args: any[]) => any;

  printResult = false;

  storedPromise = new AccessorPromise(() => {});

  typedList: BaseModelInstance<any>[] = [];

  // then = (...args: any[]) => this.storedPromise.then(...args);

  constructor(root: ClientInterface, props?: any) {
    this.root = root;
    this.uuid = '';
    this.routePath = '';
    this.parent = props?.parent;
    this.willStoreNextResult = false;
    this.doNextActionOnce = false;
    this.cache = new Cache();
    this.onCreate = () => {};
  }

  select(uuid: string): this {
    this.uuid = uuid;
    return this;
  }

  setOnCreate = (setter: AnyFunction) => {
    this.onCreate = setter;
    return this;
  };

  // eventually check the cache on these before refetching
  fetch: Skippable = () => {
    if (this.fetch.skip) return skipped();
    return AccessorPromise.fromPromise(fetcher.get(this.getPath()))
      .from(this.fetch, this, this.root)
      .process();
  };

  process = () => {
    return this;
  };

  from = (...args: any[]) => this.storedPromise.from(args[0], args[1], args[2]);

  list(limit?: number): AccessorPromise {
    if (limit) return this.some(limit);
    let res = AccessorPromise.fromPromise(fetcher.get(this.getPath()))
      .from(this.list, this, this.root)
      .as(undefined, 'list', false)
      .process();
    return res;
  }

  first(next?: string, as?: string) {
    const baseReturn = AccessorPromise.fromPromise(
      this.list()
        .then((result: any) => {
          const cleanedReult = clean(result);
          const first = cleanedReult.length > 0 ? cleanedReult[0] : null;
          return this.wrap(first);
        })
        .from(this.first, this, this.root)
        .as(undefined, 'first', false)
        .process()
    );

    switch (next) {
      case 'as':
        return baseReturn.as(as || 'first', undefined, true);
        break;
      default:
        return baseReturn;
    }
  }

  last = (ignoreAs?: string, as?: string): AccessorPromise => {
    return AccessorPromise.fromPromise(
      this.list().then((result: any) => {
        const cleanedReult = clean(result);
        const last =
          cleanedReult.length > 0
            ? cleanedReult[cleanedReult.length - 1]
            : null;
        return this.wrap(last);
      })
    ).as(as || 'last', typeof this);
  };

  some = (limit: number, as?: string): AccessorPromise => {
    return AccessorPromise.fromPromise(
      this.list().then((result: any) => {
        const cleanedReult = clean(result);
        return cleanedReult.slice(0, limit).map((item: any) => this.wrap(item));
      })
    )
      .as(as || 'some', typeof this)
      .from(this.some, this, this.root)
      .process();
  };

  count = () => {
    return AccessorPromise.fromPromise(
      this.list().then((result: any) => {
        const cleanedReult = clean(result);
        return cleanedReult.length;
      })
    ).as('count', typeof this);
  };

  delete = async () => {
    if (!this.uuid) throw new Error('uuid is not set');
    const endpointUrl = this.getPath();
    return fetcher.delete(endpointUrl);
  };

  clear = (confirm: boolean) => {
    if (!confirm) return;
    this.fetch().then((result: any) => {
      const cleanedReult = clean(result);
      cleanedReult.forEach((item: any) => {
        const model = this.wrap(item);
        model.delete();
      });
    });
  };

  getPath = (): string => {
    const relativePath = this.uuid
      ? `${this.routePath}/${this.uuid}`
      : this.routePath;
    return this.parent ? this.parent.getPath() + relativePath : relativePath;
  };

  static functionally = (data: any) => {
    return () => data;
  };

  thunk = () => {
    return this;
  };

  noOp = () => {
    return this;
  };

  functionally = (data: any) => {
    this.noOp();
    return () => data;
  };

  once = () => {
    this.doNextActionOnce = true;
    return this;
  };

  pluck = async (...fields: []) => {
    await this.list().then((result: any) => {
      const cleanedReult = clean(result);
      this.result = cleanedReult.map((item: any) => {
        const plucked: any = {};
        fields.forEach((field: string) => {
          const possibleNest = field.split('.');
          if (possibleNest.length > 1) {
            let cursor = item;
            // eslint-disable-next-line no-restricted-syntax
            for (const nestedField of possibleNest) {
              cursor = cursor[nestedField];
            }
            plucked[field] = cursor;
            return;
          }
          plucked[field] = item[field];
        });
        return plucked;
      });
    });
    this.printResult = true;
    return this;
  };

  wrap = (data: any): BaseModelInstance<typeof this.model> => {
    const Instance = this.model;
    return new Instance(this, data);
  };
}
