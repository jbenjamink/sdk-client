export default class AliasMap<T> {
  [key: string]: any;

  private _name: string | undefined;

  constructor(name = 'Unlisted') {
    this._name = name;
  }

  toString(): string {
    const typeString = this.constructor.name;
    const typeParam = typeof this[Object.keys(this)[0]];
    return `${typeString}<${this._name}>`;
  }
}
