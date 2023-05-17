import { ModelAccessor, ClientInterface } from '@sdk-client/interfaces';

import BaseModelAccessor from './BaseModelAccessor';
import Label from './ModelClasses/Label';

export default class Labels extends BaseModelAccessor<Label> {
  uuid = '';

  routePath = '/labels/';

  parent?: ModelAccessor;

  constructor(root: ClientInterface, props?: any) {
    super(root, props);
    this.parent = props?.parent;
    this.model = Label;
  }
}
