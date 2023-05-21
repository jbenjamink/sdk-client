import fetcher from '@sdk-client/classes/Fetchers/fetcher';

import BaseModelAccessor from './BaseModelAccessor';
import Integration from './ModelClasses/Integration';

export default class Integrations extends BaseModelAccessor<Integrations> {
  uuid: string;

  parentUuid: string;

  routePath = '/integrations';

  parent?: ModelAccessor<ModelInstance<any>>;

  sync: () => Promise<unknown>;

  reset: () => Promise<unknown>;

  constructor(root: ClientInterface, props?: any) {
    super(root, props);
    this.uuid = '';
    this.parentUuid = '';
    this.parent = props?.parent;
    this.model = Integration;
    // eslint-disable-next-line func-names
    this.sync = async function () {
      if (this.uuid) throw new Error('uuid is not set');
      const endpointUrl = `${this.getPath()}/sync`;
      return fetcher.post(endpointUrl);
    };

    // eslint-disable-next-line func-names
    this.reset = async function () {
      if (this.uuid) throw new Error('uuid is not set');
      const endpointUrl = `${this.getPath()}/reset`;
      return fetcher.get(endpointUrl);
    };
  }

  has = (category?: string, integration?: string) => {
    return Object.values(this.cache).some((item: any) => {
      return (
        (category ? item.category === category : true) &&
        (integration ? item.integration === integration : true)
      );
    });
  };

  getPath = (uuid?: string) => {
    const organizationUuid =
      this.root.activeOrganizationUuid || this.parent?.uuid;
    if (!organizationUuid) throw new Error('organizationUuid is not set');
    return this.fullPath(organizationUuid, uuid || this.uuid || '');
  };

  fullPath = (parentUuid: string, uuid?: string) => {
    return `/organizations/${parentUuid}/integrations/${uuid || this.uuid}`;
  };

  create = async (public_token: string, type = '') => {
    const endpointUrl = `${this.getPath()}`;
    const created = await fetcher.post(endpointUrl, {
      public_token,
      type
    });
    this.storable = created;
    this.setOnCreate(created);
    return {
      ...created,
      this: this
    };
  };

  attemptLink = async (link_token: string) => {
    const endpointUrl = `${this.getPath()}link-account`;
    const created = await fetcher.post(endpointUrl, {
      link_token
    });
    this.storable = created;
    return created;
  };

  unlink = this.delete;
}
