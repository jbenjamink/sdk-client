export default class NoOpPromise extends Promise<any> {
  noOp() {
    return this;
  }

  to = this.noOp;

  once = this.noOp;

  twice = this.noOp;
}
