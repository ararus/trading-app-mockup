import { FC, useState } from "react";
import {
  Button,
  FlexItem,
  FlexLayout,
  makePrefixer,
  Switch,
} from "@jpmorganchase/uitk-core";
import { ProfitTarget } from "./ProfitTarget";
import { observer } from "mobx-react-lite";
import { useStore } from "../../store";
import "./TakeProfitForm.css";
import { AddIcon } from "@jpmorganchase/uitk-icons";

const withBaseName = makePrefixer("tamTakeProfitForm");

export interface ITakeProfitForm {}

export const TakeProfitForm: FC<ITakeProfitForm> = observer((props) => {
  const rootStore = useStore();
  const { orderForm } = rootStore;
  const { takeProfit, setTakeProfit, addProfitTarget, profitTargets } =
    orderForm;

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
          {profitTargets.map((profitTarget, i) => {
            return <ProfitTarget key={i} store={profitTarget} />;
          })}
          <FlexLayout>
            <Button onClick={addProfitTarget}>Add profit target</Button>
          </FlexLayout>
          <FlexLayout>
            <FlexItem grow={1}>
              <span className={withBaseName("label")}>Projected profit:</span>
            </FlexItem>
            <FlexItem>
              <span className={withBaseName("projectedProfit")}>350</span>
            </FlexItem>
            <FlexItem>
              <span>USDT</span>
            </FlexItem>
          </FlexLayout>
        </>
      ) : null}
    </>
  );
});
