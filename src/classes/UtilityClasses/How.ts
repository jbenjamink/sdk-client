import { ClientInterface } from '@sdk-client/interfaces';

export default class How {
  source: ClientInterface;

  [key: string]: any;

  to(x: string) {
    return this[x];
  }

  create(x: string) {
    return this[x]('create');
  }

  a(x: string) {
    return this[x]('a');
  }

  user(x: string) {
    return this[x]('user');
  }

  constructor(source: ClientInterface) {
    this.source = source;
  }
}
