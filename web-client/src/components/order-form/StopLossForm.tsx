import { FC, useState } from "react";
import {
  FlexItem,
  FlexLayout,
  FormField,
  Input,
  makePrefixer,
  StaticInputAdornment,
  Switch,
} from "@jpmorganchase/uitk-core";
import "./StopLossForm.css";

const withBaseName = makePrefixer("tamStopLossForm");

export interface IStopLossFormProps {}

export const StopLossForm: FC<IStopLossFormProps> = (props) => {
  const [isStopLoss, setStopLoss] = useState(false);
  const onStopLossChange = (_: any, checked: boolean) => {
    setStopLoss(checked);
  };

  return (
    <>
      <Switch
        checked={isStopLoss}
        onChange={onStopLossChange}
        className={withBaseName("switch")}
        label={"Stop loss"}
      />
      {isStopLoss ? (
        <>
          <FlexLayout direction={"row"} disableWrap>
            <FlexItem>
              <FormField label={"Stop Loss"}>
                <Input
                  endAdornment={<StaticInputAdornment>%</StaticInputAdornment>}
                />
              </FormField>
            </FlexItem>
            <FlexItem>
              <FormField label={"Target price"}>
                <Input
                  endAdornment={
                    <StaticInputAdornment>USDT</StaticInputAdornment>
                  }
                />
              </FormField>
            </FlexItem>
          </FlexLayout>
          <FlexLayout>
            <span className={withBaseName("label")}>Projected loss:</span>
            <span className={withBaseName("projectedLoss")}>-350</span>
            <span>USDT</span>
          </FlexLayout>
        </>
      ) : null}
    </>
  );
};
