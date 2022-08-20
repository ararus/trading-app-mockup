import React, { useState } from "react";
import {
  BorderItem,
  BorderLayout,
  Card,
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
import { OpenOrders } from "./components/open-orders/OpenOrders";
import { observer } from "mobx-react-lite";
import { ThemeSwitcher } from "./components/theme-switcher/ThemeSwitcher";
import { Connection } from "./components/connection";

const App = observer(function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <StoreProvider>
      <ToolkitProvider density={"high"} theme={theme}>
        <div className={"tamApp"}>
          <BorderLayout gap={2} className={"tamApp-layout"}>
            <BorderItem position={"header"}>
              <Card>
                <FlexLayout separators>
                  <ThemeSwitcher theme={theme} setTheme={setTheme} />
                  <Connection />
                </FlexLayout>
              </Card>
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
            <BorderItem position={"bottom"}>
              <OpenOrders />
            </BorderItem>
          </BorderLayout>
        </div>
      </ToolkitProvider>
    </StoreProvider>
  );
});

export default App;
