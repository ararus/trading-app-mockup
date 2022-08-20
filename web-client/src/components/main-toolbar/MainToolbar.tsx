import { Card, FlexLayout } from "@jpmorganchase/uitk-core";
import { FC } from "react";
import { TokenSelector } from "../token-selector";
import { Connection } from "../connection";

export interface IMainToolbarProps {}

export const MainToolbar: FC<IMainToolbarProps> = (props) => {
  return (
    <Card>
      <FlexLayout direction={"row"}>
        <TokenSelector />
      </FlexLayout>
    </Card>
  );
};
