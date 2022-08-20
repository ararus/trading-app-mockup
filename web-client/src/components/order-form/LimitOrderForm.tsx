import { FC } from "react";
import { ToggleButton, ToggleButtonGroup } from "@jpmorganchase/uitk-lab";
import {
  FlexItem,
  FlexLayout,
  makePrefixer,
  StaticInputAdornment,
} from "@jpmorganchase/uitk-core";
import { TakeProfitForm } from "./TakeProfitForm";
import { StopLossForm } from "./StopLossForm";
import { useStore } from "../../store";
import { NumericInput } from "../common";
import { observer } from "mobx-react-lite";
import "./LimitOrderForm.css";

export interface ILimitOrderForm {}

const withBaseName = makePrefixer("tamLimitOrderForm");

export const LimitOrderForm: FC<ILimitOrderForm> = observer((props) => {
  const rootStore = useStore();
  const { orderForm, currentTokenPrice, tokenSelector } = rootStore;
  const { selectedTokenPair } = tokenSelector;

  const buySellIndex = orderForm.side === "buy" ? 0 : 1;

  const onBuySellChange = (_: any, index: number) => {
    orderForm.setSide(index === 0 ? "buy" : "sell");
  };

  const buyPriceText = currentTokenPrice ? currentTokenPrice.toFixed(4) : "?";
  const sellPriceText = currentTokenPrice ? currentTokenPrice.toFixed(4) : "?";

  const baseToken = selectedTokenPair ? selectedTokenPair.baseToken : "?";
  const quoteToken = selectedTokenPair ? selectedTokenPair.quoteToken : "?";

  return (
    <>
      <ToggleButtonGroup
        onChange={onBuySellChange}
        selectedIndex={buySellIndex}
      >
        <ToggleButton className={withBaseName("buyButton")}>
          <FlexLayout direction={"column"} gap={0}>
            <FlexItem>Buy</FlexItem>
            <FlexItem>{buyPriceText}</FlexItem>
          </FlexLayout>
        </ToggleButton>
        <ToggleButton className={withBaseName("sellButton")}>
          <FlexLayout direction={"column"} gap={0}>
            Sell
            <span>{sellPriceText}</span>
          </FlexLayout>
        </ToggleButton>
      </ToggleButtonGroup>
      <NumericInput
        field={orderForm.price}
        label={"Price"}
        endAdornment={<StaticInputAdornment>{quoteToken}</StaticInputAdornment>}
      />
      <NumericInput
        field={orderForm.amount}
        label={"Amount"}
        endAdornment={<StaticInputAdornment>{baseToken}</StaticInputAdornment>}
      />
      <NumericInput
        label={"Total"}
        field={orderForm.total}
        endAdornment={<StaticInputAdornment>{quoteToken}</StaticInputAdornment>}
      />
      <TakeProfitForm />
      <StopLossForm />
    </>
  );
});
