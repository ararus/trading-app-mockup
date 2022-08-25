import { FC } from "react";
import {
  Button,
  FlexItem,
  FlexLayout,
  FormField,
  Input,
  StaticInputAdornment,
} from "@jpmorganchase/uitk-core";
import { CloseIcon } from "@jpmorganchase/uitk-icons";
import "./ProfitTarget.css";
import { ProfitTargetStore } from "../../store";
import { NumericInput } from "../common";

export interface IProfitTargetProps {
  store: ProfitTargetStore;
}

export const ProfitTarget: FC<IProfitTargetProps> = (props) => {
  const { store } = props;

  return (
    <>
      <FlexLayout direction={"row"} align={"center"} disableWrap>
        <FlexItem>
          <NumericInput
            field={store.profit}
            label={"Profit"}
            endAdornment={<StaticInputAdornment>%</StaticInputAdornment>}
          />
        </FlexItem>
        <FlexItem>
          <NumericInput
            field={store.targetPrice}
            label={"Target price"}
            endAdornment={<StaticInputAdornment>USDT</StaticInputAdornment>}
          />
        </FlexItem>
        <FlexItem>
          <NumericInput
            label={"Amount to sell"}
            field={store.amountToSell}
            endAdornment={<StaticInputAdornment>%</StaticInputAdornment>}
          />
        </FlexItem>
        <FlexItem>
          <Button
            disabled={!store.canDelete}
            className={"tam-removeProfitTarget"}
            onClick={store.delete}
          >
            <CloseIcon />
          </Button>
        </FlexItem>
      </FlexLayout>
    </>
  );
};
