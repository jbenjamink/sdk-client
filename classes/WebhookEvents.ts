import { ClientInterface, ModelAccessor } from '@lib/sdk-client/interfaces';

import BaseAccessor from './BaseModelAccessor';
import WebhookEvent from './ModelClasses/WebhookEvent';

export default class WebhookEvents extends BaseAccessor {
  uuid = '';

  routePath = '/webhooks/events';

  parent?: ModelAccessor;

  constructor(root: ClientInterface, props?: BaseAccessor) {
    super(root, props);
    this.parent = props?.parent;
    this.model = WebhookEvent;
  }
}
