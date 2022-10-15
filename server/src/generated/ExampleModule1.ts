import {Observable} from "rxjs";

export interface ITokenPair {
	baseToken: string;
	quoteToken: string;
}
export interface ITokenPrice {
	token: string;
	priceUsd: number;
}
export interface IPriceLevel {
	price: number;
	amount: number;
	total: number;
}
export interface IOrderBook {
	buyLevels: IPriceLevel[];
	sellLevels: IPriceLevel[];
	lastPrice: number;
	lastPriceUsd: number;
	change: number;
}
export interface IOpenOrder {
	id: string;
	tokenPair: string;
	side: string;
	amount: number;
	failed: number;
	price: number;
	time: string;
}
export interface IOpenOrders {
	items: IOpenOrder[];
}

export interface IDummyService {
	getTokenPairs: () => Observable<string[]>;
	getPriceStream: () => Observable<ITokenPrice[]>;
	getOrderBook: (tokenPair: string, priceLevelSize: number) => Observable<IOrderBook>;
	getOpenOrders: () => Observable<IOpenOrders>;
}
