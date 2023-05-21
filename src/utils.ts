import NoOpPromise from './classes/NoOpPromise';
import AccessorPromise from './classes/AccessorPromise';

export const clean = (result: any) => {
  return Object.keys(result).length === 1 && Object.keys(result)[0] === 'data'
    ? result.data
    : result;
};

/* @deprecated */
export const skipped = (): NoOpPromise => {
  return AccessorPromise.noOp();
};
