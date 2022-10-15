export interface IStreamRequest<T = any> {
  type: "subscribe";
  name: string;
  data?: T;
  key: string;
}

export interface IStreamUnsub {
  type: "unsubscribe";
  name: string;
  key: string;
}

export interface IStreamReply<T = any> {
  name: string;
  data?: T;
  key: string;
}
