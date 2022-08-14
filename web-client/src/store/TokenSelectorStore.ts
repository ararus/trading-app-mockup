import { action, computed, makeObservable, observable } from "mobx";
import { TokenPair } from "./TokenPair";
import { TokenPairInfo } from "./TokenPairInfo";
import { RootStore } from "./RootStore";

export class TokenSelectorStore {
  private readonly _rootStore: RootStore;
  private readonly _searchQuery = observable.box<string>("");
  private readonly _selectedTabIndex = observable.box<number>(0);
  private readonly _selectedTokenPair = observable.box<TokenPair | undefined>(
    undefined
  );
  public readonly tabs = ["Favorites", "BTC", "ETH", "USDT", "BNB", "ALL"];

  constructor(rootStore: RootStore) {
    makeObservable(this, {
      searchQuery: computed,
      setSearchQuery: action,
      selectedTabIndex: computed,
      selectTab: action,
      filteredPairs: computed,
      selectedTokenPair: computed,
      selectTokenPair: action,
    });
    this._rootStore = rootStore;
  }

  public get searchQuery(): string {
    return this._searchQuery.get();
  }

  public setSearchQuery = (query: string) => {
    this._searchQuery.set(query);
  };

  public get selectedTabIndex(): number {
    return this._selectedTabIndex.get();
  }

  public selectTab = (tabIndex: number) => {
    this._selectedTabIndex.set(tabIndex);
  };

  public get filteredPairs(): TokenPairInfo[] {
    let result = this._rootStore.tokenPairInfos;
    if (this.selectedTabIndex === 0) {
      result = result.filter((p) => p.isFavorite);
    } else {
      if (this.tabs[this.selectedTabIndex] !== "ALL") {
        result = result.filter(
          (p) => p.tokenPair.quoteToken === this.tabs[this.selectedTabIndex]
        );
      }
    }
    if (this.searchQuery) {
      const upperSearchQuery = this.searchQuery.toUpperCase();
      result = result.filter(
        (p) =>
          p.tokenPair.baseToken.includes(upperSearchQuery) ||
          p.tokenPair.quoteToken.includes(upperSearchQuery)
      );
    }
    return result;
  }

  public get selectedTokenPair() {
    return this._selectedTokenPair.get();
  }

  public selectTokenPair = (tokenPair: TokenPair) => {
    this._selectedTokenPair.set(tokenPair);
  };
}
