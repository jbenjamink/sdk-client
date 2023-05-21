import BaseModelAccessor from './BaseModelAccessor';
import WebhookEvent from './ModelClasses/WebhookEvent';

export default class WebhookEvents extends BaseModelAccessor<WebhookEvent> {
  uuid = '';

  routePath = '/webhooks/events';

  parent?: ModelAccessor<ModelInstance<any>>;

  constructor(root: ClientInterface, props?: any) {
    super(root, props);
    this.parent = props?.parent;
    this.model = WebhookEvent;
  }
}
