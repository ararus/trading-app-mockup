import { Card, makePrefixer } from "@jpmorganchase/uitk-core";
import { FC } from "react";
import { observer } from "mobx-react-lite";
import {
  RowSelectionColumn,
  Table,
  TableCellValueProps,
  TableColumn,
} from "../common";
import { useStore } from "../../store";
import { OpenOrder } from "../../store/OpenOrdersStore";
import "./OpenOrders.css";
import cn from "classnames";

const withBaseName = makePrefixer("tamOpenOrders");

export interface IOpenOrdersProps {}

const rowKeyGetter = (x: OpenOrder) => x.id;

const sideValueGetter = ({ side }: OpenOrder) => {
  return (
    <span
      className={cn(withBaseName("side"), {
        [withBaseName("side-sell")]: side === "Sell",
        [withBaseName("side-buy")]: side === "Buy",
      })}
    >
      {side}
    </span>
  );
};

const TimeCellValue: FC<TableCellValueProps> = (props) => {
  const time = props.value as Date;
  return (
    <div>
      {time.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </div>
  );
};

const priceValueGetter = (x: OpenOrder) => x.price;

export const OpenOrders: FC<IOpenOrdersProps> = observer((props) => {
  const { openOrders } = useStore();

  const data = [...openOrders.orders]; // TODO

  return (
    <Card className={withBaseName()}>
      <Table
        className={withBaseName("table")}
        rowData={data}
        rowKeyGetter={rowKeyGetter}
        isZebra={true}
      >
        <RowSelectionColumn id={"rowSelection"} />
        <TableColumn
          id={"tokenPair"}
          name={"Token Pair"}
          defaultWidth={100}
          getValue={(x) => x.tokenPair}
        />
        <TableColumn
          id={"side"}
          name={"Side"}
          defaultWidth={100}
          getValue={sideValueGetter}
        />
        <TableColumn
          id={"price"}
          name={"Price"}
          align={"right"}
          defaultWidth={100}
          getValue={priceValueGetter}
        />
        <TableColumn
          id={"amount"}
          name={"Amount"}
          align={"right"}
          defaultWidth={100}
          getValue={(x) => x.amount}
        />
        <TableColumn
          id={"failed"}
          name={"Failed"}
          align={"right"}
          defaultWidth={100}
          getValue={(x) => x.failed}
        />
        <TableColumn
          id={"time"}
          name={"Time"}
          defaultWidth={100}
          getValue={(x) => x.time}
          cellValueComponent={TimeCellValue}
        />
      </Table>
    </Card>
  );
});
