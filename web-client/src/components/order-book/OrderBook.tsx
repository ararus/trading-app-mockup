import { observer } from "mobx-react-lite";
import { FC } from "react";
import {
  Card,
  FlexItem,
  FlexLayout,
  makePrefixer,
} from "@jpmorganchase/uitk-core";
import "./OrderBook.css";
import {
  Dropdown,
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

// const PriceCell: FC<IGridListCellProps<IPriceLevel> = observer((props) => {
//   return <Cell class
// })
//
// const columns: IGridListColumn<IPriceLevel>[] = [
//   {
//     header: "Price BTC",
//     cellComponent: PriceCell,
//     width: "130px",
//   }, {
//     header: "Amount ACA",
//     cellComponent: AmountCell,
//     width: "auto",
//   }, {
//     header: "Total BTC",
//     cellComponent: TotalCell,
//     width: "auto"
//   }
// ];

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
        {/*<GridList data={dummyData} columns={columns} />*/}
      </FlexLayout>
    </Card>
  );
});
