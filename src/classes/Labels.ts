import BaseModelAccessor from './BaseModelAccessor';
import Label from './ModelClasses/Label';

export default class Labels extends BaseModelAccessor<Label> {
  uuid = '';

  routePath = '/labels/';

  parent?: ModelAccessor<ModelInstance<any>>;

  constructor(root: ClientInterface, props?: any) {
    super(root, props);
    this.parent = props?.parent;
    this.model = Label;
  }
}
