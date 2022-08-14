import { FC, useState } from "react";
import {
  FlexLayout,
  FormField,
  Input,
  StaticInputAdornment,
  Switch,
} from "@jpmorganchase/uitk-core";

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
        className={"tam-takeProfitSwitch"}
        label={"Stop loss"}
      />
      {isStopLoss ? (
        <>
          <FlexLayout>
            <FormField label={"Stop Loss"}>
              <Input
                endAdornment={<StaticInputAdornment>%</StaticInputAdornment>}
              />
            </FormField>
            <FormField label={"Target price"}>
              <Input
                endAdornment={<StaticInputAdornment>USDT</StaticInputAdornment>}
              />
            </FormField>
          </FlexLayout>
          <FlexLayout>
            <span className={"tam-flexLabel"}>Projected loss:</span>
            <span className={"tam-projectedLoss"}>-350</span>
            <span>USDT</span>
          </FlexLayout>
        </>
      ) : null}
    </>
  );
};
