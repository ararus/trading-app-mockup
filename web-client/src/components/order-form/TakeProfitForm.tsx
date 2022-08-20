import { FC, useState } from "react";
import { FlexLayout, makePrefixer, Switch } from "@jpmorganchase/uitk-core";
import { ProfitTarget } from "./ProfitTarget";
import { observer } from "mobx-react-lite";
import { useStore } from "../../store";
import "./TakeProfitForm.css";

const withBaseName = makePrefixer("tamTakeProfitForm");

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
        className={withBaseName("switch")}
        label={"Take profit"}
      />
      {takeProfit ? (
        <>
          <ProfitTarget />
          <ProfitTarget />
          <FlexLayout>
            <span className={withBaseName("label")}>Projected profit:</span>
            <span className={withBaseName("projectedProfit")}>350</span>
            <span>USDT</span>
          </FlexLayout>
        </>
      ) : null}
    </>
  );
});
