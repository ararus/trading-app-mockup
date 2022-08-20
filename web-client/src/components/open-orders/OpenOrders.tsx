import { Card, makePrefixer } from "@jpmorganchase/uitk-core";
import { FC } from "react";
import { observer } from "mobx-react-lite";
import { RowSelectionColumn, Table, TableColumn } from "../common";
import { useStore } from "../../store";
import { OpenOrder } from "../../store/OpenOrdersStore";
import "./OpenOrders.css";

const withBaseName = makePrefixer("tamOpenOrders");

export interface IOpenOrdersProps {}

const rowKeyGetter = (x: OpenOrder) => x.id;

export const OpenOrders: FC<IOpenOrdersProps> = observer((props) => {
  const { openOrders } = useStore();

  const data = [...openOrders.orders]; // TODO

  return (
    <Card className={withBaseName()}>
      <Table
        className={withBaseName("table")}
        rowData={data}
        rowKeyGetter={rowKeyGetter}
      >
        <RowSelectionColumn id={"rowSelection"} />
        <TableColumn
          id={"tokenPair"}
          name={"Token Pair"}
          width={100}
          getValue={(x) => x.tokenPair}
        />
        <TableColumn
          id={"side"}
          name={"Side"}
          width={100}
          getValue={(x) => x.side}
        />
        <TableColumn
          id={"price"}
          name={"Price"}
          width={100}
          getValue={(x) => x.price}
        />
        <TableColumn
          id={"amount"}
          name={"Amount"}
          width={100}
          getValue={(x) => x.amount}
        />
        <TableColumn
          id={"failed"}
          name={"Failed"}
          width={100}
          getValue={(x) => x.failed}
        />
        <TableColumn
          id={"time"}
          name={"Time"}
          width={100}
          getValue={(x) => x.time.toString()}
        />
        {/*<SpaceFillColumn id={"spaceFill"} />*/}
      </Table>
    </Card>
  );
});
