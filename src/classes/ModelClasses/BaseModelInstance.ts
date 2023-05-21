import {
  ModelAccessor,
  ModelInstance,
  Skippable
} from '@sdk-client/interfaces';
import { skipped } from '@sdk-client/utils';
import fetcher from '@sdk-client/classes/Fetchers/fetcher';
import AccessorPromise from '@sdk-client/classes/AccessorPromise';
import ModelList from '@sdk-client/classes/ModelList';

export default class BaseModelInstance<T> implements ModelInstance {
  uuid: string;

  routePath: string;

  accessor?: ModelAccessor;

  storable?: unknown;

  data: any;

  constructor(accessor: ModelAccessor, data: any) {
    this.accessor = accessor;
    this.uuid = data?.uuid;
    this.routePath = `${accessor.routePath}/${data.uuid}`;
    this.data = data;
  }

  select(uuid: string): this {
    this.uuid = uuid;
    return this;
  }

  refetch = () => {
    return AccessorPromise.fromPromise(fetcher.get(this.getPath()))
      .from(this.refetch)
      .response();
  };

  delete = async () => {
    if (!this.uuid) throw new Error('uuid is not set');
    const endpointUrl = this.getPath();
    return fetcher.delete(endpointUrl);
  };

  update = async (data: any) => {
    if (!this.uuid) throw new Error('uuid is not set');
    const endpointUrl = this.getPath();
    await fetcher.put(endpointUrl, data);
    return this;
  };

  getPath = (): string => {
    return this.accessor?.getPath(this.uuid) || '';
  };

  toString = (): string => {
    const dataAsJsonString = JSON.stringify(this.data, null, 2)
      .split('\n')
      .join('\n\t');
    return `${this.constructor.name} ${dataAsJsonString}`;
  };

  toJSON = (): any => {
    return this.data;
  };

  static listOf<T extends BaseModelInstance<any>>(
    this: { new (accessor: ModelAccessor, data: any): T },
    accessor: ModelAccessor,
    data: any
  ): ModelList<T> {
    const mapped = data.map((item: any) => {
      return new this(accessor, item);
    });
    return new ModelList<T>(...mapped);
  }
}
