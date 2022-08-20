import { FC, useState } from "react";
import "./OrderForm.css";
import { Card, FlexLayout, makePrefixer } from "@jpmorganchase/uitk-core";
import { Tab, Tabstrip } from "@jpmorganchase/uitk-lab";
import { LimitOrderForm } from "./LimitOrderForm";

export interface IOrderForm {}

const withBaseName = makePrefixer("tamOrderForm");

export const OrderForm: FC<IOrderForm> = (props) => {
  const tabs = ["Limit", "Market", "Stop", "Stop Limit"];
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);

  const onTabChange = (tabIndex: number) => {
    setSelectedTabIndex(tabIndex);
  };

  return (
    <div>
      <Card className={withBaseName()}>
        <FlexLayout direction="column">
          <Tabstrip tabIndex={selectedTabIndex} onActiveChange={onTabChange}>
            {tabs.map((tab, i) => (
              <Tab label={tab} key={i} />
            ))}
          </Tabstrip>
          {selectedTabIndex === 0 ? <LimitOrderForm /> : null}
        </FlexLayout>
      </Card>
    </div>
  );
};
