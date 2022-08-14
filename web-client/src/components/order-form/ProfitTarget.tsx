import { FC } from "react";
import {
  Button,
  FlexLayout,
  FormField,
  Input,
  StaticInputAdornment,
} from "@jpmorganchase/uitk-core";
import { CloseIcon } from "@jpmorganchase/uitk-icons";

export interface IProfitTargetProps {}

export const ProfitTarget: FC<IProfitTargetProps> = (props) => {
  return (
    <>
      <FlexLayout align={"center"}>
        <FormField label={"Profit"}>
          <Input
            endAdornment={<StaticInputAdornment>%</StaticInputAdornment>}
          />
        </FormField>
        <FormField label={"Target price"}>
          <Input
            endAdornment={<StaticInputAdornment>USDT</StaticInputAdornment>}
          />
        </FormField>
        <FormField label={"Amount to sell"}>
          <Input
            endAdornment={<StaticInputAdornment>%</StaticInputAdornment>}
          />
        </FormField>
        <Button className={"tam-removeProfitTarget"}>
          <CloseIcon />
        </Button>
      </FlexLayout>
    </>
  );
};
