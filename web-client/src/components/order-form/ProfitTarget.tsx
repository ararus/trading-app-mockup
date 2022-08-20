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

export interface IProfitTargetProps {}

export const ProfitTarget: FC<IProfitTargetProps> = (props) => {
  return (
    <>
      <FlexLayout direction={"row"} align={"center"} disableWrap>
        <FlexItem>
          <FormField label={"Profit"}>
            <Input
              endAdornment={<StaticInputAdornment>%</StaticInputAdornment>}
            />
          </FormField>
        </FlexItem>
        <FlexItem>
          <FormField label={"Target price"}>
            <Input
              endAdornment={<StaticInputAdornment>USDT</StaticInputAdornment>}
            />
          </FormField>
        </FlexItem>
        <FlexItem>
          <FormField label={"Amount to sell"}>
            <Input
              endAdornment={<StaticInputAdornment>%</StaticInputAdornment>}
            />
          </FormField>
        </FlexItem>
        <FlexItem>
          <Button className={"tam-removeProfitTarget"}>
            <CloseIcon />
          </Button>
        </FlexItem>
      </FlexLayout>
    </>
  );
};
