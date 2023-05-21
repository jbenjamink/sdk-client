import BaseAccessor from './BaseModelAccessor';
import Label from './ModelClasses/Label';
import BaseModelInstance from './ModelClasses/BaseModelInstance';
import Task from './ModelClasses/Task';

export type ModelArray<T extends ModelInstance<T>> = ModelInstance<T>[];

export default class ModelList<T extends ModelInstance<T>> extends Array<T> {
  constructor(...values: T[]) {
    super();
    super.push(...values);
    // Object.setPrototypeOf(this, Object.create(ModelList.prototype))
  }

  map(callback: (element: T, index: number, array: T[]) => any): Array<any> {
    var obj = new ModelList(...this);
    if (obj.length === 0) return [];
    if (typeof callback === 'undefined') return obj;

    for (var i = 0, o; (o = obj[i]); i++) {
      obj[i] = callback(o, i, obj);
    }

    return obj;
  }

  toString(): string {
    const instanceType =
      this.length > 0 ? this[0].constructor.name : 'ModelInstance';
    const valueStrings = this.map(value => `${value.toString()}`).join(', ');
    return `${instanceType}List [ \n\t${valueStrings} ]`;
  }
}
