import { action, autorun, computed, makeObservable, observable } from "mobx";
import { RootStore } from "./RootStore";
import { ServerApi } from "./ServerApi";
import { Subscription, take } from "rxjs";

class AutoSub {
  private _sub?: Subscription;

  public subscribe(fn: () => Subscription) {
    this.unsubscribe();
    this._sub = fn();
  }

  public unsubscribe() {
    if (this._sub) {
      this._sub.unsubscribe();
      this._sub = undefined;
    }
  }
}

export class ConnectionStore {
  private readonly _isConnected = observable.box<boolean>(false);
  private readonly _rootStore: RootStore;
  private _serverApi: ServerApi = new ServerApi();

  private _pricesSub = new AutoSub();
  private _orderBookSub = new AutoSub();
  private _openOrdersSub = new AutoSub();

  constructor(rootStore: RootStore) {
    makeObservable(this, {
      connect: action,
      disconnect: action,
      isConnected: computed,
    });
    this._rootStore = rootStore;

    // Subscribe to prices when connected
    autorun(() => {
      if (this.isConnected) {
        this._pricesSub.subscribe(() =>
          this._serverApi.getPriceStream().subscribe((prices) => {
            this._rootStore.updatePrices(prices);
          })
        );
      } else {
        this._pricesSub.unsubscribe();
      }
    });

    // Subscribe to order book when connected and has a token pair selected
    autorun(() => {
      if (this.isConnected) {
        const tokenPair = this._rootStore.tokenSelector.selectedTokenPair;
        if (tokenPair) {
          this._orderBookSub.subscribe(() =>
            this._serverApi
              .getOrderBook(tokenPair.name, 0.00001)
              .subscribe((orderBook) => {
                this._rootStore.updateOrderBook(orderBook);
              })
          );
          return;
        }
      }
      this._orderBookSub.unsubscribe();
    });

    // Subscribe to open orders when connected?
    autorun(() => {
      if (this.isConnected) {
        this._openOrdersSub.subscribe(() =>
          this._serverApi.getOpenOrders().subscribe((x) => {
            this._rootStore.openOrders.update(x);
          })
        );
        return;
      }
      this._openOrdersSub.unsubscribe();
    });
  }

  public get isConnected() {
    return this._isConnected.get();
  }

  public connect = () => {
    this._isConnected.set(true);
    this._serverApi
      .getTokenPairs()
      .pipe(take(1))
      .subscribe((tokenPairs) => {
        this._rootStore.updateTokenPairs(
          tokenPairs.map((s) => {
            const [baseToken, quoteToken] = s.split("/");
            return {
              baseToken,
              quoteToken,
            };
          })
        );
      });
  };

  public disconnect = () => {
    this._isConnected.set(false);
  };
}
