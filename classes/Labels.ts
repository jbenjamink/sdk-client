import { ModelAccessor, ClientInterface } from '@lib/sdk-client/interfaces';

import BaseAccessor from './BaseModelAccessor';
import Label from './ModelClasses/Label';

export default class Labels extends BaseAccessor {
  uuid = '';

  routePath = '/labels/';

  parent?: ModelAccessor;

  constructor(root: ClientInterface, props?: BaseAccessor) {
    super(root, props);
    this.parent = props?.parent;
    this.model = Label;
  }
}
