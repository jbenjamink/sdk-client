import Client from './classes/Client';

declare global {
  interface Window {
    Client: typeof Client;
  }
}

const instance = new Client();

export default instance;
