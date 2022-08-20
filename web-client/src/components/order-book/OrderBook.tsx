import { observer } from "mobx-react-lite";
import { FC, ReactNode, useMemo } from "react";
import {
  Card,
  FlexItem,
  FlexLayout,
  makePrefixer,
} from "@jpmorganchase/uitk-core";
import "./OrderBook.css";
import {
  Dropdown,
  LabelCaption,
  ToggleButton,
  ToggleButtonGroup,
} from "@jpmorganchase/uitk-lab";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  SwapIcon,
} from "@jpmorganchase/uitk-icons";
import { GridList, IGridListCellProps, IGridListColumn } from "../common";
import { useStore } from "../../store";
import { IPriceLevel } from "../../dtos";

const withBaseName = makePrefixer("tamOrderBook");

export interface IOrderBookProps {}

const dropdownSource = ["0.00001", "0.000001", "0.0000001", "0.00000001"];

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

export interface ILastPricePanelProps {
  lastPrice: number;
  lastPriceUsd: number;
  change: number;
}

export const LastPricePanel: FC<ILastPricePanelProps> = (props) => {
  const { lastPrice, lastPriceUsd, change } = props;
  return (
    <div className={withBaseName("lastPricePanel")}>
      <LabelCaption>Last price</LabelCaption>
      <LabelCaption>USD</LabelCaption>
      <LabelCaption>Change</LabelCaption>
      <div>{lastPrice.toFixed(9)}</div>
      <div>{lastPriceUsd.toFixed(9)}</div>
      <div>{change.toFixed(4)}</div>
    </div>
  );
};

export const OrderBook: FC<IOrderBookProps> = observer((props) => {
  const { orderBook, tokenSelector } = useStore();
  const { selectedTokenPair } = tokenSelector;

  const [sellColumns, buyColumns] = useMemo(() => {
    const sellColumns: IGridListColumn<IPriceLevel>[] = [
      {
        header: `Price ${selectedTokenPair?.baseToken}`,
        cellComponent: SellPriceCell,
        width: "130px",
      },
      {
        header: `Amount ${selectedTokenPair?.quoteToken}`,
        cellComponent: AmountCell,
        width: "auto",
      },
      {
        header: `Total ${selectedTokenPair?.baseToken}`,
        cellComponent: TotalCell,
        width: "auto",
        textAlign: "right",
      },
    ];

    const buyColumns: IGridListColumn<IPriceLevel>[] = [
      { ...sellColumns[0], cellComponent: BuyPriceCell },
      ...sellColumns.slice(1),
    ];
    return [sellColumns, buyColumns];
  }, [selectedTokenPair]);

  return (
    <Card className={withBaseName()}>
      <FlexLayout
        direction={"column"}
        disableWrap
        className={withBaseName("content")}
      >
        <FlexItem>
          <FlexLayout align={"center"}>
            <FlexItem grow={1}>
              <span className={withBaseName("title")}>Order book</span>
            </FlexItem>
            <FlexItem>
              <Dropdown
                width={100}
                source={dropdownSource}
                defaultValue={dropdownSource[0]}
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
          <GridList
            data={orderBook.sellLevels}
            columns={sellColumns}
            className={withBaseName("sellGridList")}
          />
        </FlexItem>
        <FlexItem>
          <LastPricePanel
            lastPrice={orderBook.lastPrice}
            lastPriceUsd={orderBook.lastPriceUsd}
            change={orderBook.change}
          />
        </FlexItem>
        <FlexItem grow={1} className={withBaseName("buyLayout")}>
          <GridList
            data={orderBook.buyLevels}
            columns={buyColumns}
            showHeader={false}
            className={withBaseName("buyGridList")}
          />
        </FlexItem>
      </FlexLayout>
    </Card>
  );
});
