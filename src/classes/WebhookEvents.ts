import { ClientInterface, ModelAccessor } from '@sdk-client/interfaces';

import BaseModelAccessor from './BaseModelAccessor';
import WebhookEvent from './ModelClasses/WebhookEvent';

export default class WebhookEvents extends BaseModelAccessor<WebhookEvent> {
  uuid = '';

  routePath = '/webhooks/events';

  parent?: ModelAccessor;

  constructor(root: ClientInterface, props?: any) {
    super(root, props);
    this.parent = props?.parent;
    this.model = WebhookEvent;
  }
}
