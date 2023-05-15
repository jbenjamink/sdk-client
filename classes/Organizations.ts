import { ClientInterface } from '@lib/sdk-client/interfaces';

import BaseAccessor from './BaseModelAccessor';

export default class Organizations extends BaseAccessor {
  uuid: string;

  routePath = '/organizations';

  constructor(root: ClientInterface, uuid = '', props?: BaseAccessor) {
    super(root, props);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.uuid = uuid;
  }
}
