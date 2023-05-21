export default class NoOpPromise<T = void>
  extends Promise<T>
  implements INoOpPromise
{
  constructor() {
    super(() => {});
  }

  noOp(): INoOpPromise {
    return this;
  }

  to = this.noOp;

  once = this.noOp;

  twice = this.noOp;
}
