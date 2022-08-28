import { observer } from "mobx-react-lite";
import { CSSProperties, FC, ReactNode, useMemo } from "react";
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
import {
  GridList,
  IGridListCellProps,
  IGridListColumn,
  Table,
  TableCellProps,
  TableCellValueProps,
  TableColumn,
  TableProps,
} from "../common";
import { useStore } from "../../store";
import { IPriceLevel } from "../../dtos";

const withBaseName = makePrefixer("tamOrderBook");

export interface IOrderBookProps {}

const dropdownSource = ["0.00001", "0.000001", "0.0000001", "0.00000001"];

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

const MobxTable = observer((props: TableProps<IPriceLevel>) => {
  const { rowData, ...rest } = props;
  return <Table rowData={[...rowData]} {...rest} />;
});

function TotalCellValue(props: TableCellValueProps<IPriceLevel>) {
  const value = props.row.data.total;
  const style: CSSProperties = {
    width: `${Math.round(value * 100)}px`,
  };
  return (
    <div className={withBaseName("total")}>
      <div className={withBaseName("totalBar")} style={style} />
      <div className={withBaseName("totalValue")}>{value}</div>
    </div>
  );
}

export const OrderBook: FC<IOrderBookProps> = observer((props) => {
  const { orderBook, tokenSelector } = useStore();
  const { selectedTokenPair } = tokenSelector;

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
          <MobxTable
            className={withBaseName("sellTable")}
            rowData={orderBook.sellLevels}
            zebra={true}
          >
            <TableColumn
              id={"price"}
              name={`Price ${selectedTokenPair?.baseToken || ""}`}
              align={"right"}
              getValue={(x: IPriceLevel) => x.price.toFixed(9)}
            />
            <TableColumn
              id={"amount"}
              name={`Amount ${selectedTokenPair?.quoteToken || ""}`}
              align={"right"}
              getValue={(x: IPriceLevel) => x.amount.toFixed(2)}
            />
            <TableColumn
              id={"total"}
              name={`Total ${selectedTokenPair?.baseToken || ""}`}
              align={"right"}
              cellValueComponent={TotalCellValue}
              getValue={(x: IPriceLevel) => x.total.toFixed(7)}
            />
          </MobxTable>
        </FlexItem>
        <FlexItem>
          <LastPricePanel
            lastPrice={orderBook.lastPrice}
            lastPriceUsd={orderBook.lastPriceUsd}
            change={orderBook.change}
          />
        </FlexItem>
        <FlexItem grow={1} className={withBaseName("buyLayout")}>
          <MobxTable
            className={withBaseName("buyTable")}
            rowData={orderBook.buyLevels}
            zebra={true}
            hideHeader={true}
          >
            <TableColumn
              id={"price"}
              name={`Price ${selectedTokenPair?.baseToken || ""}`}
              align={"right"}
              getValue={(x: IPriceLevel) => x.price.toFixed(9)}
            />
            <TableColumn
              id={"amount"}
              name={`Amount ${selectedTokenPair?.quoteToken || ""}`}
              align={"right"}
              getValue={(x: IPriceLevel) => x.amount.toFixed(2)}
            />
            <TableColumn
              id={"total"}
              name={`Total ${selectedTokenPair?.baseToken || ""}`}
              align={"right"}
              cellValueComponent={TotalCellValue}
              getValue={(x: IPriceLevel) => x.total.toFixed(7)}
            />
          </MobxTable>
        </FlexItem>
      </FlexLayout>
    </Card>
  );
});
