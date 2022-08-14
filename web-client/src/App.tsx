import React from "react";
import {
  BorderItem,
  BorderLayout,
  FlexItem,
  FlexLayout,
  ToolkitProvider,
} from "@jpmorganchase/uitk-core";
import "@jpmorganchase/uitk-theme/index.css";
import "./App.css";
import { OrderForm } from "./components/order-form";
import { StoreProvider } from "./store";
import { MainToolbar } from "./components/main-toolbar";
import { OrderBook } from "./components/order-book";

function App() {
  return (
    <ToolkitProvider density={"high"} theme={"light"}>
      <StoreProvider>
        <BorderLayout gap={2}>
          <BorderItem position={"header"}>
            <div>HEADER</div>
          </BorderItem>
          <BorderItem position={"right"}>
            <OrderForm />
          </BorderItem>
          <BorderItem position={"main"}>
            <FlexLayout direction={"column"} justify={"center"}>
              <FlexItem>
                <MainToolbar />
              </FlexItem>
            </FlexLayout>
          </BorderItem>
          <BorderItem position={"left"}>
            <OrderBook />
          </BorderItem>
        </BorderLayout>
      </StoreProvider>
    </ToolkitProvider>
  );
}

export default App;
