export type AnyFunction = (...args: any[]) => any;

export type Credentials = {
  email: string;
  password: string;
};

export type ConfigProps = {
  email?: string;
  password?: string;
  isLoggedIn?: boolean;
  user?: any;
  organization?: any;
  settings?: any;
  accessToken?: string;
  dispatchLogin?: AnyFunction;
};
