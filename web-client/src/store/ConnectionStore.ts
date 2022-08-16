import { action, autorun, computed, makeObservable, observable } from "mobx";
import { RootStore } from "./RootStore";
import { ServerApi } from "./ServerApi";
import { Subscription, take } from "rxjs";

export class ConnectionStore {
  private readonly _isConnected = observable.box<boolean>(false);
  private readonly _rootStore: RootStore;
  private _serverApi: ServerApi = new ServerApi();
  private _pricesSubscription?: Subscription;
  private _orderBookSubscription?: Subscription;

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
        if (this._pricesSubscription) {
          this._pricesSubscription.unsubscribe();
        }
        this._pricesSubscription = this._serverApi
          .getPriceStream()
          .subscribe((prices) => {
            this._rootStore.updatePrices(prices);
          });
      } else {
        if (this._pricesSubscription) {
          this._pricesSubscription.unsubscribe();
          this._pricesSubscription = undefined;
        }
      }
    });

    // Subscribe to order book when connected and has a token pair selected
    autorun(() => {
      if (this.isConnected) {
        const tokenPair = this._rootStore.tokenSelector.selectedTokenPair;
        if (tokenPair) {
          if (this._orderBookSubscription) {
            this._orderBookSubscription.unsubscribe();
          }
          this._orderBookSubscription = this._serverApi
            .getOrderBook(tokenPair.name, 0.00001)
            .subscribe((orderBook) => {
              this._rootStore.updateOrderBook(orderBook);
            });
          return;
        }
      }
      if (this._orderBookSubscription) {
        this._orderBookSubscription.unsubscribe();
        this._orderBookSubscription = undefined;
      }
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
    if (this._pricesSubscription) {
      this._pricesSubscription.unsubscribe();
      this._pricesSubscription = undefined;
    }
    if (this._orderBookSubscription) {
      this._orderBookSubscription.unsubscribe();
      this._orderBookSubscription = undefined;
    }
    this._isConnected.set(false);
  };
}
