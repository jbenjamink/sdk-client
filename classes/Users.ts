import { ModelAccessor, ClientInterface } from '@lib/sdk-client/interfaces';
import fetcher from '@utils/fetcher';

import BaseModel from './BaseModelAccessor';
import User from './ModelClasses/User';

export default class Users extends BaseModel {
  uuid = '';

  routePath = '/users';

  parent?: ModelAccessor;

  constructor(root: ClientInterface, parent?: BaseModel, props?: BaseModel) {
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
