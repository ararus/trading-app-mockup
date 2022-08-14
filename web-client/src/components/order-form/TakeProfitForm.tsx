import { FC, useState } from "react";
import { FlexLayout, Switch } from "@jpmorganchase/uitk-core";
import { ProfitTarget } from "./ProfitTarget";
import { observer } from "mobx-react-lite";
import { useStore } from "../../store";

export interface ITakeProfitForm {}

export const TakeProfitForm: FC<ITakeProfitForm> = observer((props) => {
  const rootStore = useStore();
  const { orderForm } = rootStore;
  const { takeProfit, setTakeProfit } = orderForm;

  const onTakeProfitChange = (_: any, checked: boolean) => {
    setTakeProfit(checked);
  };

  return (
    <>
      <Switch
        checked={takeProfit}
        onChange={onTakeProfitChange}
        className={"tam-takeProfitSwitch"}
        label={"Take profit"}
      />
      {takeProfit ? (
        <>
          <ProfitTarget />
          <ProfitTarget />
          <FlexLayout>
            <span className={"tam-flexLabel"}>Projected profit:</span>
            <span className={"tam-projectedProfit"}>350</span>
            <span>USDT</span>
          </FlexLayout>
        </>
      ) : null}
    </>
  );
});
