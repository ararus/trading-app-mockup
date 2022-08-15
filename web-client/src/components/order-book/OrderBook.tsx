import { observer } from "mobx-react-lite";
import { FC, ReactNode } from "react";
import {
  Card,
  FlexItem,
  FlexLayout,
  makePrefixer,
  Panel,
} from "@jpmorganchase/uitk-core";
import "./OrderBook.css";
import {
  Dropdown,
  LabelCaption,
  Text,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
} from "@jpmorganchase/uitk-lab";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  SwapIcon,
} from "@jpmorganchase/uitk-icons";
import { GridList, IGridListCellProps, IGridListColumn } from "../common";
import cn from "classnames";

const withBaseName = makePrefixer("tamOrderBook");

export interface IOrderBookProps {}

const dropdownSource = ["0.00001", "0.000001", "0.0000001", "0.00000001"];

interface IPriceLevel {
  price: number;
  amount: number;
  total: number;
}

const dummyData: IPriceLevel[] = [
  {
    price: 1.00001,
    amount: 123456,
    total: 0.12345,
  },
  {
    price: 1.00001,
    amount: 123456,
    total: 0.12345,
  },
  {
    price: 1.00001,
    amount: 123456,
    total: 0.12345,
  },
];

function cell<T>(className: string, getter: (dataItem: T) => ReactNode) {
  return (props: IGridListCellProps<T>) => {
    const value = getter(props.dataItem);
    return <div className={withBaseName(className)}>{value}</div>;
  };
}

const SellPriceCell = cell<IPriceLevel>("sellPrice", (x) => x.price.toFixed(9));
const BuyPriceCell = cell<IPriceLevel>("buyPrice", (x) => x.price.toFixed(9));
const AmountCell = cell<IPriceLevel>("amount", (x) => x.amount.toFixed(2));
const TotalCell = cell<IPriceLevel>("total", (x) => x.total.toFixed(7));

const sellColumns: IGridListColumn<IPriceLevel>[] = [
  {
    header: "Price BTC",
    cellComponent: SellPriceCell,
    width: "130px",
  },
  {
    header: "Amount ACA",
    cellComponent: AmountCell,
    width: "auto",
  },
  {
    header: "Total BTC",
    cellComponent: TotalCell,
    width: "auto",
  },
];

const buyColumns: IGridListColumn<IPriceLevel>[] = [
  { ...sellColumns[0], cellComponent: BuyPriceCell },
  ...sellColumns.slice(1),
];

export interface ILastPricePanelProps {}

export const LastPricePanel: FC<ILastPricePanelProps> = (props) => {
  return (
    <div className={withBaseName("lastPricePanel")}>
      <LabelCaption>Last price</LabelCaption>
      <LabelCaption>USD</LabelCaption>
      <LabelCaption>Change</LabelCaption>
      <div>12345</div>
      <div>123</div>
      <div>123%</div>
    </div>
  );
};

export const OrderBook: FC<IOrderBookProps> = observer((props) => {
  return (
    <Card className={withBaseName()}>
      <FlexLayout direction={"column"} className={withBaseName("content")}>
        <FlexItem>
          <FlexLayout align={"center"}>
            <FlexItem grow={1}>
              <span className={withBaseName("title")}>Order book</span>
            </FlexItem>
            <FlexItem>
              <Dropdown
                width={100}
                source={dropdownSource}
                initialSelectedItem={dropdownSource[0]}
              />
            </FlexItem>
            <FlexItem>
              <ToggleButtonGroup>
                <ToggleButton>
                  <ArrowUpIcon />
                </ToggleButton>
                <ToggleButton>
                  <SwapIcon />
                </ToggleButton>
                <ToggleButton>
                  <ArrowDownIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </FlexItem>
          </FlexLayout>
        </FlexItem>
        <FlexItem grow={1} className={withBaseName("sellLayout")}>
          <GridList data={dummyData} columns={sellColumns} />
        </FlexItem>
        <FlexItem>
          <LastPricePanel />
        </FlexItem>
        <FlexItem grow={1}>
          <GridList data={dummyData} columns={buyColumns} showHeader={false} />
        </FlexItem>
      </FlexLayout>
    </Card>
  );
});
