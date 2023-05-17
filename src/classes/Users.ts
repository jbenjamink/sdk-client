import { ModelAccessor, ClientInterface } from '@sdk-client/interfaces';
import fetcher from '@sdk-client/classes/Fetchers/fetcher';

import BaseModelAccessor from './BaseModelAccessor';
import User from './ModelClasses/User';
import BaseModelInstance from './ModelClasses/BaseModelInstance';

export default class Users extends BaseModelAccessor<User> {
  uuid = '';

  routePath = '/users';

  parent?: ModelAccessor;

  constructor(
    root: ClientInterface,
    parent?: BaseModelAccessor<BaseModelInstance<any>>,
    props?: any
  ) {
    super(root, props);
    this.parent = parent?.parent;
    this.model = User;
  }

  // don't call this directly, use the root client's my() method
  _me = async () => {
    const endpointUrl = `${this.getPath()}/me`;
    return fetcher.get(endpointUrl);
  };
}
