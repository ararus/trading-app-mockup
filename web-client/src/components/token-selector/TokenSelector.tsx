import {
  FC,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import "./TokenSelector.css";
import {
  Button,
  Card,
  FlexItem,
  FlexLayout,
  FormField,
  Input,
  makePrefixer,
  Portal,
  StaticInputAdornment,
  useFloatingUI,
  useWindow,
} from "@jpmorganchase/uitk-core";
import { ToggleButton, ToggleButtonGroup } from "@jpmorganchase/uitk-lab";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  FavoriteIcon,
  FavoriteSolidIcon,
  SearchIcon,
} from "@jpmorganchase/uitk-icons";
import { GridList, IGridListCellProps, IGridListColumn } from "../common";
import cn from "classnames";
import {
  ITokenSelectorContext,
  TokenSelectorContext,
  useTokenSelectorContext,
} from "./TokenSelectorContext";
import { TokenPair, TokenPairInfo, useStore } from "../../store";
import { observer } from "mobx-react-lite";

const withBaseName = makePrefixer("tamTokenSelector");

export interface ITokenSelectorProps {}

export interface ICellProps {
  className: string;
  children: ReactNode;
}

const TokenPairCell: FC<IGridListCellProps<TokenPairInfo>> = observer(
  (props) => {
    const { tokenPair, isFavorite } = props.dataItem;
    const { toggleFavorite } = useTokenSelectorContext();

    const Icon = isFavorite ? FavoriteSolidIcon : FavoriteIcon;

    // TODO decide how to toggle favourite flag
    const onToggleFavorite: MouseEventHandler<HTMLButtonElement> = (event) => {
      toggleFavorite(props.dataItem.tokenPair);
      props.dataItem.setFavorite(!props.dataItem.isFavorite);
      event.preventDefault();
      event.stopPropagation();
    };

    return (
      <div className={withBaseName("tokenPair")}>
        <FlexLayout align={"center"} gap={1}>
          <Button variant={"secondary"} onClick={onToggleFavorite}>
            <Icon className={withBaseName("favoriteIcon")} />
          </Button>
          {tokenPair.name}
        </FlexLayout>
      </div>
    );
  }
);

const LastPriceCell: FC<IGridListCellProps<TokenPairInfo>> = observer(
  (props) => {
    const { lastPrice, lastPriceUsd } = props.dataItem;
    return (
      <div className={withBaseName("lastPriceCell")}>
        <span className={withBaseName("lastPrice")}>
          {lastPrice.toFixed(3)}
        </span>
        <span className={withBaseName("lastPriceUsd")}>
          {` / $${lastPriceUsd.toFixed(2)}`}
        </span>
      </div>
    );
  }
);

const ChangeCell: FC<IGridListCellProps<TokenPairInfo>> = observer((props) => {
  const { change24h } = props.dataItem;
  return (
    <div
      className={cn(withBaseName("change"), {
        [withBaseName("positiveChange")]: change24h >= 0,
        [withBaseName("negativeChange")]: change24h < 0,
      })}
    >
      {`${(change24h * 100).toFixed(2)}%`}
    </div>
  );
});

const gridListColumns: IGridListColumn<TokenPairInfo>[] = [
  {
    header: "Token pair",
    cellComponent: TokenPairCell,
    width: "130px",
  },
  {
    header: "Last price",
    cellComponent: LastPriceCell,
    width: "auto",
  },
  {
    header: "Change 24h",
    cellComponent: ChangeCell,
    textAlign: "right",
    width: "auto",
  },
];

export const TokenSelector: FC<ITokenSelectorProps> = observer((props) => {
  const rootStore = useStore();
  const { tokenSelector } = rootStore;
  const {
    filteredPairs,
    selectedTabIndex,
    selectTab,
    searchQuery,
    setSearchQuery,
    selectedTokenPair,
    selectTokenPair,
  } = tokenSelector;
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const onButtonClick = () => {
    setIsOpen((old) => !old);
  };

  const onTabChange = (_: any, tabIndex: number) => {
    selectTab(tabIndex);
  };

  const onSearchQueryChange = (_: any, value: string) => {
    setSearchQuery(value);
  };

  const buttonText = selectedTokenPair?.name || "Select Token";

  const onRowClick = (rowIndex: number) => {
    selectTokenPair(filteredPairs[rowIndex].tokenPair);
    setIsOpen(false);
  };

  const IconComponent = isOpen ? ChevronUpIcon : ChevronDownIcon;

  const { reference, floating, x, y, strategy } = useFloatingUI({
    placement: "bottom-start",
  });

  const toggleFavorite = useCallback((tokenPair: TokenPair) => {
    // TODO
  }, []);

  const contextValue: ITokenSelectorContext = useMemo(
    () => ({
      toggleFavorite,
    }),
    [toggleFavorite]
  );

  return (
    <div className={withBaseName()} ref={reference}>
      <TokenSelectorContext.Provider value={contextValue}>
        <div
          className={withBaseName("button")}
          ref={buttonRef}
          onClick={onButtonClick}
        >
          <Button variant={"secondary"}>
            <FlexLayout align={"center"}>
              {buttonText}
              <IconComponent
                className={withBaseName("expanderIcon")}
                size={12}
              />
            </FlexLayout>
          </Button>
        </div>
        {isOpen ? (
          <Portal>
            <Card
              className={withBaseName("popup")}
              ref={floating}
              style={{
                top: y ?? "",
                left: x ?? "",
                position: strategy,
              }}
            >
              <FlexLayout
                direction={"column"}
                className={withBaseName("popupContent")}
              >
                <FlexItem>
                  <ToggleButtonGroup
                    selectedIndex={selectedTabIndex}
                    onChange={onTabChange}
                  >
                    <ToggleButton>Favorites</ToggleButton>
                    <ToggleButton>BTC</ToggleButton>
                    <ToggleButton>ETH</ToggleButton>
                    <ToggleButton>USDT</ToggleButton>
                    <ToggleButton>BNB</ToggleButton>
                    <ToggleButton>All</ToggleButton>
                  </ToggleButtonGroup>
                </FlexItem>
                <FlexItem>
                  <FormField label={"Search"}>
                    <Input
                      value={searchQuery}
                      onChange={onSearchQueryChange}
                      startAdornment={
                        <StaticInputAdornment>
                          <SearchIcon className={withBaseName("searchIcon")} />
                        </StaticInputAdornment>
                      }
                    />
                  </FormField>
                </FlexItem>
                <FlexItem grow={1}>
                  <GridList
                    className={withBaseName("gridList")}
                    data={filteredPairs}
                    columns={gridListColumns}
                    onRowClick={onRowClick}
                  />
                </FlexItem>
              </FlexLayout>
            </Card>
          </Portal>
        ) : null}
      </TokenSelectorContext.Provider>
    </div>
  );
});
