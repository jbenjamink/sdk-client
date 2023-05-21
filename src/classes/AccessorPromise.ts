/* eslint-disable no-param-reassign */
import cache, { Cache } from '@sdk-client/cache';
import { AnyFunction } from '@sdk-client/types';
import { clean } from '@sdk-client/utils';

import NoOpPromise from '@sdk-client/classes/NoOpPromise';

export default class AccessorPromise<T>
  extends Promise<T>
  implements IAccessorPromise<T>
{
  lastCaller: Skippable | null = null;

  accessor?: ModelAccessor<T>;

  sdk?: ClientInterface;

  cache = Cache.callable();

  processed = false;

  typedValue: any;

  constructor(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void
    ) => void
  ) {
    super(executor);
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined
  ): AccessorPromise<TResult1 | TResult2> {
    return new AccessorPromise((resolve, reject) => {
      super
        .then((value: any) => {
          let typedValue = this.typedValue || value;

          if (!this.processed && this.accessor?.model) {
            const ModelConstructor = this.accessor.model;
            const { typedList } = this.accessor;
            if (Array.isArray(value)) {
              typedValue = ModelConstructor.listOf(this.accessor, value);
            } else {
              typedValue = new ModelConstructor(this.accessor!, value);
            }
            this.processed = true;
            this.typedValue = typedValue;
          }
          if (onfulfilled) {
            return onfulfilled(typedValue);
          }
          return typedValue;
        }, onrejected)
        .then(resolve, reject);
    });
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | null
      | undefined
  ): AccessorPromise<T | TResult> {
    return new AccessorPromise((resolve, reject) => {
      super.catch(onrejected).then(resolve, reject);
    });
  }

  finally(onfinally?: (() => void) | null | undefined): AccessorPromise<T> {
    return new AccessorPromise((resolve, reject) => {
      super.finally(onfinally).then(resolve, reject);
    });
  }

  as(cacheKey?: string, caller?: string, returnAccessor = false): this {
    // const { cacheKey, returnAccessor } = options || {};
    this.then((result: any) => {
      if (cacheKey) cache.set(cacheKey, result);
    });
    return this;
  }

  cacheTo = this.as;

  result: ModelAccessor<T> | undefined;

  process(callback?: AnyFunction): this {
    this.then((result: any) => {
      const data = clean(result);
      // const ModelConstructor = this.accessor?.model;
      let modeled = result;
      // if (typeof data === 'object') {
      //   modeled = ModelConstructor
      //     ? new ModelConstructor(this.accessor!, data)
      //     : data;
      // }
      if (this.lastCaller) this.lastCaller.cache = modeled;
      if (this.accessor) this.accessor.current = modeled;
      if (this.accessor && this.lastCaller)
        this.accessor.cache[this.lastCaller.name] = modeled;
      this.result = result;
      if (this.sdk) {
        this.sdk.cache.last = modeled;
        if (this.accessor?.constructor.name)
          this.sdk.cache[this.accessor.constructor.name] = modeled;
      }
      if (callback) callback(data);
    });
    return this;
  }

  cacheSafely = this.process;

  resolve = (fn?: any) => {
    this.process().then(fn());
    return this;
  };

  async response() {
    await this.process();
    return this.result;
  }

  set(fn?: any) {
    this.process(fn);
    return this.sdk ? this.sdk : this;
  }

  to = this.set;

  disable(m: ModelAccessor<T>, f: Skippable, shouldDisable: boolean) {
    if (shouldDisable) {
      f.skip = true;
      m.doNextCallOnce = false;
    }
    return this;
  }

  from(fn: any, m?: ModelAccessor<T>, i?: ClientInterface) {
    this.lastCaller = fn;
    this.accessor = m;
    this.sdk = i;
    return this;
  }

  once() {
    if (this.lastCaller) this.lastCaller.skip = true;
    return this;
  }

  twice() {
    if (this.lastCaller?.willSkip) this.lastCaller.skip = true;
    if (this.lastCaller) this.lastCaller.willSkip = true;
    return this;
  }

  static fromPromise<T>(promise: Promise<any>) {
    return new AccessorPromise((resolve: any, reject: any) => {
      promise.then(resolve).catch(reject);
    }) as AccessorPromise<T>;
  }

  static noOp() {
    return new NoOpPromise();
  }

  toString() {
    return `AccessorPromise<${this.lastCaller?.name}>`;
  }
}
