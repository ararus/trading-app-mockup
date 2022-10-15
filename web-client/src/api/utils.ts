import { map } from "rxjs";
import { IStreamReply } from "../dtos";

export function requestStream<T = any>(
  ws: any,
  name: string,
  key: string = name,
  data?: T
) {
  return ws
    .multiplex(
      () => ({ type: "subscribe", name, key, data }),
      () => ({ type: "unsubscribe", key }),
      (message: IStreamReply<T>) => message.key === key
    )
    .pipe(map((message: IStreamReply<T>) => message.data));
}
