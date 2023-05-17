/* eslint-disable no-param-reassign */
import cache, { Cache } from '@sdk-client/cache';
import {
  ModelAccessor,
  ClientInterface,
  Skippable
} from '@sdk-client/interfaces';
import { AnyFunction } from '@sdk-client/types';
import { clean } from '@sdk-client/utils';

import NoOpPromise from './NoOpPromise';

export default class AccessorPromise extends Promise<any> {
  lastCaller: Skippable | null = null;

  accessor?: ModelAccessor;

  sdk?: ClientInterface;

  cache = Cache.callable();

  processed = false;

  typedValue: any;

  then<TResult, TError>(
    onfulfilled?:
      | ((value: any) => TResult | PromiseLike<TResult>)
      | null
      | undefined,
    onrejected?:
      | ((reason: any) => TError | PromiseLike<TError>)
      | null
      | undefined
  ): AccessorPromise {
    super.then((value: any) => {
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
      return typedValue as any as TResult;
    }, onrejected);
    return this;
  }

  as(cacheKey?: string, caller?: string, returnAccessor = false): this {
    // const { cacheKey, returnAccessor } = options || {};
    this.then((result: any) => {
      if (cacheKey) cache.set(cacheKey, result);
    });
    return this;
  }

  cacheTo = this.as;

  result: ModelAccessor | undefined;

  process(callback?: AnyFunction) {
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

  disable(m: ModelAccessor, f: Skippable, shouldDisable: boolean) {
    if (shouldDisable) {
      f.skip = true;
      m.doNextCallOnce = false;
    }
    return this;
  }

  from(fn: any, m?: ModelAccessor, i?: ClientInterface) {
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

  static fromPromise(promise: Promise<any>) {
    return new AccessorPromise((resolve: any, reject: any) => {
      promise.then(resolve).catch(reject);
    });
  }

  static noOp() {
    return new NoOpPromise((resolve: any) => resolve());
  }

  toString() {
    return `AccessorPromise<${this.lastCaller?.name}>`;
  }
}
