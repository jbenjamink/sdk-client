import { ClientInterface } from '@sdk-client/interfaces';

import BaseModelAccessor from './BaseModelAccessor';

export default class Organizations extends BaseModelAccessor<Organizations> {
  uuid: string;

  routePath = '/organizations';

  constructor(root: ClientInterface, uuid = '', props?: any) {
    super(root, props);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.uuid = uuid;
  }
}
