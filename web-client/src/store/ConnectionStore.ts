import { action, computed, makeObservable, observable } from "mobx";
import { RootStore } from "./RootStore";
import { ITokenPairInfo } from "../dtos";

export class ConnectionStore {
  private _ws?: WebSocket;
  private readonly _isConnected = observable.box<boolean>(false);
  private readonly _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    makeObservable(this, {
      connect: action,
      disconnect: action,
      isConnected: computed,
    });
    this._rootStore = rootStore;
  }

  public get isConnected() {
    return this._isConnected.get();
  }

  public connect = () => {
    try {
      this._ws = new WebSocket("ws://localhost:3000/api/prices");
      this._ws.onopen = () => {
        console.log("WebSocket Client Connected");
        console.log("Requesting token pairs");
        this._ws?.send(JSON.stringify({ type: "tokenPairs" }));
      };
      this._ws.onmessage = (message) => {
        const msg = JSON.parse(message.data);
        if (msg.type === "tokenPairs") {
          console.log(`Token pairs received`);
          this._rootStore.updateTokenPairs(msg.data);
          this._ws?.send(JSON.stringify({ type: "tokenPrices" }));
        } else if (msg.type === "tokenPrices") {
          console.log(`Token prices received`);
          this._rootStore.updatePrices(msg.data);
        }
      };
      this._ws.onerror = () => {
        console.log(`Connection failed`);
        this._isConnected.set(false);
      };
      this._isConnected.set(true);
    } catch (err) {
      console.log(`Failed to connect`, err);
      this._isConnected.set(false);
    }
  };

  public requestPrices = () => {
    if (this.isConnected) {
      this._ws?.send(JSON.stringify({ type: "tokenPrices" }));
    }
  };

  public disconnect = () => {
    this._ws?.close();
    this._isConnected.set(false);
  };
}
