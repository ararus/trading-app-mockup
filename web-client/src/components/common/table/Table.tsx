import {
  Children,
  isValidElement,
  KeyboardEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  WheelEventHandler,
} from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { TableColumnProps } from "./TableColumn";
import { TableContext } from "./TableContext";
import cx from "classnames";
import {
  CellMeasure,
  clamp,
  LeftPart,
  MiddlePart,
  PAGE_SIZE,
  RightPart,
  Scrollable,
  TopLeftPart,
  TopPart,
  TopRightPart,
  useBodyVisibleAreaTop,
  useBodyVisibleColumnRange,
  useClientMidHeight,
  useClientMidWidth,
  useCols,
  useColumnGroups,
  useColumnRange,
  useHeadVisibleColumnRange,
  useLeftScrolledOutWidth,
  useProd,
  useRowIdxByKey,
  useRowModels,
  useScrollToCell,
  useSelectRows,
  useSum,
  useSumRangeWidth,
  useSumWidth,
  useVisibleColumnGroupRange,
  useVisibleRowRange,
} from "./internal";
import "./Table.css";
import { SelectionContext } from "./SelectionContext";
import { ColumnGroupProps } from "./ColumnGroup";
import { SizingContext } from "./SizingContext";
import { LayoutContext } from "./LayoutContext"; // TODO remove

const withBaseName = makePrefixer("uitkTable");

export type ColumnSeparatorType = "regular" | "none" | "groupEdge";
export type ColumnGroupRowSeparatorType = "first" | "regular" | "last";
export type ColumnGroupColumnSeparatorType = "regular" | "none";

export interface TableProps {
  children: ReactNode;
  isZebra?: boolean;
  rowData: any[];
  rowKeyGetter: (row: any) => string;
  className?: string;
}

export interface Size {
  height: number;
  width: number;
}

export interface TableRowModel {
  key: string;
  index: number;
  data: any;
}

export interface TableColumnModel {
  index: number;
  separator: ColumnSeparatorType;
  data: TableColumnProps;
}

export interface TableColumnGroupModel {
  index: number;
  data: ColumnGroupProps;
  childrenIds: string[];
  rowSeparator: ColumnGroupRowSeparatorType;
  columnSeparator: ColumnGroupColumnSeparatorType;
  colSpan: number;
}

function useFlatten<T>(map: Map<number, T>): T[] {
  return useMemo(() => {
    const entries = [...map.entries()].filter(([index, value]) => !!value);
    entries.sort((a, b) => a[0] - b[0]);
    return entries.map((x) => x[1]);
  }, [map]);
}

export const Table = (props: TableProps) => {
  const { rowData, isZebra, className, rowKeyGetter, children } = props;

  // if (rowData.length > 0) {
  //   console.log(`Row 0 price: ${rowData[0].price}`);
  // }

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const middleRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [scrollLeft, setScrollLeft] = useState<number>(0);
  const [scrollTop, setScrollTop] = useState<number>(0);

  const [leftColMap, setLeftColMap] = useState<Map<number, TableColumnProps>>(
    new Map()
  );
  const [rightColMap, setRightColMap] = useState<Map<number, TableColumnProps>>(
    new Map()
  );
  const [midColMap, setMidColMap] = useState<Map<number, TableColumnProps>>(
    new Map()
  );
  const [leftGrpMap, setLeftGrpMap] = useState<Map<number, ColumnGroupProps>>(
    new Map()
  );
  const [rightGrpMap, setRightGrpMap] = useState<Map<number, ColumnGroupProps>>(
    new Map()
  );
  const [midGrpMap, setMidGrpMap] = useState<Map<number, ColumnGroupProps>>(
    new Map()
  );

  const leftColPs = useFlatten(leftColMap);
  const rightColPs = useFlatten(rightColMap);
  const midColPs = useFlatten(midColMap);

  const leftGrpPs = useFlatten(leftGrpMap);
  const rightGrpPs = useFlatten(rightGrpMap);
  const midGrpPs = useFlatten(midGrpMap);

  const [hoverRowKey, setHoverRowKey] = useState<string | undefined>(undefined);

  const [clientWidth, setClientWidth] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [selRowKeys, setSelRowKeys] = useState<Set<string>>(new Set());
  const [lastSelRowKey, setLastSelRowKey] = useState<string | undefined>(
    undefined
  );
  const [rowHeight, setRowHeight] = useState<number>(0);

  const [cursorRowKey, setCursorRowKey] = useState<string | undefined>(
    undefined
  );
  const [cursorColKey, setCursorColKey] = useState<string | undefined>(
    undefined
  );

  const rowIdxByKey = useRowIdxByKey(rowKeyGetter, rowData);

  const leftGroups = useColumnGroups(leftGrpPs, 0);
  const midGroups = useColumnGroups(midGrpPs, leftGroups.length);
  const rightGroups = useColumnGroups(
    rightGrpPs,
    leftGroups.length + midGroups.length
  );

  const leftCols: TableColumnModel[] = useCols(leftColPs, 0, leftGroups);
  const midCols: TableColumnModel[] = useCols(
    midColPs,
    leftCols.length,
    midGroups
  );
  const rightCols: TableColumnModel[] = useCols(
    rightColPs,
    leftCols.length + midCols.length,
    rightGroups
  );

  const midColsById = useMemo(
    () => new Map<string, TableColumnModel>(midCols.map((c) => [c.data.id, c])),
    [midCols]
  );

  const leftWidth = useSumWidth(leftCols);
  const midWidth = useSumWidth(midCols);
  const rightWidth = useSumWidth(rightCols);
  const totalWidth = useSum([leftWidth, midWidth, rightWidth]);

  const hasColumnGroups =
    leftGroups.length > 0 || midGroups.length > 0 || rightGroups.length > 0;

  const headRowCount = hasColumnGroups ? 2 : 1; // TODO multiple group levels
  const rowCount = rowData.length;
  // console.log(`RowCount: ${rowCount}`);
  const botRowCount = 0; // TODO
  const topHeight = useProd([rowHeight, headRowCount]);
  const midHeight = useProd([rowHeight, rowCount]);
  const botHeight = useProd([botRowCount, rowHeight]);
  const totalHeight = useSum([topHeight, midHeight, botHeight]);
  const clientMidWidth = useClientMidWidth(clientWidth, leftWidth, rightWidth);
  const midGap = Math.max(0, clientMidWidth - midWidth);

  const bodyVisColRng = useBodyVisibleColumnRange(
    midCols,
    scrollLeft,
    clientMidWidth
  );

  const midGrpByColId = useMemo(() => {
    const m = new Map<string, TableColumnGroupModel>();
    for (let g of midGroups) {
      for (let c of g.childrenIds) {
        m.set(c, g);
      }
    }
    return m;
  }, [midGroups]);

  const visColGrpRng = useVisibleColumnGroupRange(
    bodyVisColRng,
    midCols,
    midGrpByColId,
    leftGroups.length
  );

  const visColGrps = useMemo(() => {
    return midGroups.slice(visColGrpRng.start, visColGrpRng.end);
  }, [visColGrpRng, midGroups]);

  const headVisColRng = useHeadVisibleColumnRange(
    bodyVisColRng,
    visColGrps,
    midColsById,
    leftCols.length
  );

  const bodyScrOutColWh = useLeftScrolledOutWidth(midCols, bodyVisColRng);
  const headScrOutColWh = useLeftScrolledOutWidth(midCols, headVisColRng);

  const bodyVisAreaLeft = useSum([leftWidth, bodyScrOutColWh]);
  const headVisAreaLeft = useSum([leftWidth, headScrOutColWh]);
  const clientMidHeight = useClientMidHeight(
    clientHeight,
    topHeight,
    botHeight
  );
  const visRowRng = useVisibleRowRange(
    scrollTop,
    clientMidHeight,
    rowHeight,
    rowCount
  );

  const bodyVisAreaTop = useBodyVisibleAreaTop(rowHeight, visRowRng, topHeight);

  const bodyVisibleColumns = useColumnRange(midCols, bodyVisColRng);
  const headVisibleColumns = useColumnRange(midCols, headVisColRng);
  const bodyVisColWh = useSumRangeWidth(midCols, bodyVisColRng);

  const headVisColWh = bodyVisColWh; // TODO implement groups

  const style = useMemo(
    () =>
      ({
        ["--uitkTable-totalWidth"]: `${totalWidth}px`,
        ["--uitkTable-totalHeight"]: `${totalHeight}px`,
        ["--uitkTable-topHeight"]: `${topHeight}px`,
        ["--uitkTable-leftWidth"]: `${leftWidth}px`,
        ["--uitkTable-rightWidth"]: `${rightWidth}px`,
        ["--uitkTable-bodyVisibleColumnWidth"]: `${bodyVisColWh}px`,
        ["--uitkTable-bodyVisibleAreaTop"]: `${bodyVisAreaTop}px`,
        ["--uitkTable-bodyVisibleAreaLeft"]: `${bodyVisAreaLeft}px`,
        ["--uitkTable-bottomHeight"]: `${botHeight}px`,
        ["--uitkTable-headerVisibleColumnWidth"]: `${headVisColWh}px`,
        ["--uitkTable-headerVisibleAreaLeft"]: `${headVisAreaLeft}px`,
      } as any),
    [
      totalHeight,
      totalWidth,
      topHeight,
      leftWidth,
      rightWidth,
      botHeight,
      bodyVisColWh,
      bodyVisAreaLeft,
      bodyVisAreaTop,
      headVisColWh,
      headVisAreaLeft,
    ]
  );

  useEffect(() => {
    if (rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      if (rect.height !== clientHeight) {
        setClientHeight(rect.height);
      }
      if (rect.width !== clientWidth) {
        setClientWidth(rect.width);
      }
    }
  });

  const onWheel: WheelEventHandler<HTMLTableElement> = useCallback(
    ({ deltaX, deltaY }) => {
      const s = scrollableRef.current;
      if (s) {
        s.scrollLeft += deltaX;
        s.scrollTop += deltaY;
      }
    },
    [scrollableRef.current]
  );

  const chPosById = useRef<Map<string, number>>(new Map());

  const indexChildren = () => {
    const m = new Map<string, number>();
    let i = 0;
    const indexChildrenRec = (c: ReactNode) => {
      if (!c) {
        return;
      }
      Children.forEach(c, (x) => {
        if (isValidElement(x) && x.props.id !== undefined) {
          m.set(x.props.id, i);
          i++;
          indexChildrenRec(x.props.children);
        }
      });
    };
    indexChildrenRec(children);
    return m;
  };
  chPosById.current = indexChildren();

  const getChildIndex = (id: string): number => {
    const idx = chPosById.current.get(id);
    if (idx === undefined) {
      throw new Error(`Unknown child id: "${id}"`);
    }
    return idx;
  };

  const onColumnAdded = useCallback((columnProps: TableColumnProps) => {
    const { pinned = null } = columnProps;
    const adder = (old: Map<number, TableColumnProps>) => {
      const next = new Map(old);
      next.set(getChildIndex(columnProps.id), columnProps);
      return next;
    };
    if (pinned === "left") {
      setLeftColMap(adder);
    } else if (pinned === "right") {
      setRightColMap(adder);
    } else {
      setMidColMap(adder);
    }
    // console.log(`Column added: "${columnProps.name}"`);
  }, []);

  const onColumnGroupAdded = useCallback((colGroupProps: ColumnGroupProps) => {
    const { pinned = null } = colGroupProps;
    const adder = (old: Map<number, ColumnGroupProps>) => {
      const next = new Map(old);
      next.set(getChildIndex(colGroupProps.id), colGroupProps);
      return next;
    };
    if (pinned === "left") {
      setLeftGrpMap(adder);
    } else if (pinned === "right") {
      setRightGrpMap(adder);
    } else {
      setMidGrpMap(adder);
    }
    // console.log(`Group added: "${colGroupProps.name}"`);
  }, []);

  const onColumnRemoved = useCallback((columnProps: TableColumnProps) => {
    const { pinned } = columnProps;
    const remover = (old: Map<number, TableColumnProps>) => {
      const next = new Map(old);
      next.delete(getChildIndex(columnProps.id));
      return next;
    };
    if (pinned === "left") {
      setLeftColMap(remover);
    } else if (pinned === "right") {
      setRightColMap(remover);
    } else {
      setMidColMap(remover);
    }
    // console.log(`Column removed: "${columnProps.name}"`);
  }, []);

  const onColumnGroupRemoved = useCallback(
    (colGroupProps: ColumnGroupProps) => {
      // console.log(`Group removed: "${colGroupProps.name}"`);
      const { pinned } = colGroupProps;
      const remover = (old: Map<number, ColumnGroupProps>) => {
        const next = new Map(old);
        old.delete(getChildIndex(colGroupProps.id));
        return next;
      };
      if (pinned === "left") {
        setLeftGrpMap(remover);
      } else if (pinned === "right") {
        setRightGrpMap(remover);
      } else {
        setMidGrpMap(remover);
      }
      // console.log(`Group removed: "${colGroupProps.name}"`);
    },
    []
  );

  const cols = useMemo(
    () => [...leftCols, ...midCols, ...rightCols],
    [leftCols, midCols, rightCols]
  );

  const colIdxByKey = useMemo(
    () => new Map<string, number>(cols.map((c, i) => [c.data.id, c.index])),
    [cols]
  );

  const cursorColIdx =
    cursorColKey === undefined ? 0 : colIdxByKey.get(cursorColKey) || 0;
  const cursorRowIdx =
    cursorRowKey === undefined ? 0 : rowIdxByKey.get(cursorRowKey) || 0;

  const scrollToCell = useScrollToCell(
    visRowRng,
    setScrollTop,
    rowHeight,
    clientMidHeight,
    midCols,
    bodyVisColRng,
    setScrollLeft,
    clientMidWidth
  );

  const moveCursor = useCallback(
    (rowIdx: number, colIdx: number) => {
      if (rowData.length < 1 || cols.length < 1) {
        return;
      }
      rowIdx = clamp(rowIdx, 0, rowData.length - 1);
      colIdx = clamp(colIdx, 0, cols.length - 1);
      setCursorRowKey(rowKeyGetter(rowData[rowIdx]));
      setCursorColKey(cols[colIdx].data.id);
      scrollToCell(rowIdx, colIdx);
      rootRef.current?.focus();
    },
    [
      setCursorRowKey,
      setCursorColKey,
      rowData,
      rowKeyGetter,
      cols,
      rootRef.current,
      scrollToCell,
    ]
  );

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      switch (event.key) {
        case "ArrowLeft":
          moveCursor(cursorRowIdx, cursorColIdx - 1);
          break;
        case "ArrowRight":
          moveCursor(cursorRowIdx, cursorColIdx + 1);
          break;
        case "ArrowUp":
          moveCursor(cursorRowIdx - 1, cursorColIdx);
          break;
        case "ArrowDown":
          moveCursor(cursorRowIdx + 1, cursorColIdx);
          break;
        case "PageUp":
          moveCursor(cursorRowIdx - PAGE_SIZE, cursorColIdx);
          break;
        case "PageDown":
          moveCursor(cursorRowIdx + PAGE_SIZE, cursorColIdx);
          break;
        case "Home":
          moveCursor(0, cursorColIdx);
          break;
        case "End":
          moveCursor(rowData.length - 1, cursorColIdx);
          break;
      }
    },
    [cursorRowIdx, cursorColIdx, moveCursor]
  );

  const rows = useRowModels(rowKeyGetter, rowData, visRowRng);

  const contextValue: TableContext = useMemo(
    () => ({
      onColumnAdded,
      onColumnRemoved,
      onColumnGroupAdded,
      onColumnGroupRemoved,
    }),
    [onColumnAdded, onColumnRemoved, onColumnGroupAdded, onColumnGroupRemoved]
  );

  const isLeftRaised = scrollLeft > 0;
  const isRightRaised = scrollLeft + clientMidWidth < midWidth;

  const selectRows = useSelectRows(
    lastSelRowKey,
    setSelRowKeys,
    setLastSelRowKey,
    rowData,
    rowIdxByKey,
    rowKeyGetter
  );

  const isAllSelected = selRowKeys.size === rowData.length;
  const isAnySelected = selRowKeys.size > 0;

  const selectAll = useCallback(() => {
    setSelRowKeys(new Set(rowData.map((d) => rowKeyGetter(d))));
  }, [rowData, setSelRowKeys]);

  const unselectAll = useCallback(() => {
    setSelRowKeys(new Set());
  }, [setSelRowKeys]);

  const selCtValue: SelectionContext = useMemo(
    () => ({
      selRowKeys,
      isAllSelected,
      isAnySelected,
      selectRows,
      selectAll,
      unselectAll,
      cursorRowKey,
      cursorColKey,
      moveCursor,
    }),
    [
      selRowKeys,
      selectRows,
      cursorRowKey,
      cursorColKey,
      moveCursor,
      isAllSelected,
      isAnySelected,
      selectAll,
      unselectAll,
    ]
  );

  const resizeColumn = useCallback(
    (colIdx: number, width: number) => {
      const col = cols[colIdx];
      if (col.data.onWidthChanged) {
        col.data.onWidthChanged(width);
      }
    },
    [cols]
  );

  const sizingCtValue: SizingContext = useMemo(
    () => ({
      resizeColumn,
      rowHeight,
    }),
    [resizeColumn, rowHeight]
  );

  const layoutCtValue: LayoutContext = useMemo(
    () => ({
      totalHeight,
      totalWidth,
      clientWidth,
      clientHeight,
    }),
    [totalHeight, totalWidth]
  );

  return (
    <TableContext.Provider value={contextValue}>
      <LayoutContext.Provider value={layoutCtValue}>
        <SelectionContext.Provider value={selCtValue}>
          <SizingContext.Provider value={sizingCtValue}>
            {props.children}
            <div
              className={cx(
                withBaseName(),
                {
                  [withBaseName("zebra")]: isZebra,
                },
                className
              )}
              style={style}
              ref={rootRef}
              tabIndex={0}
              onKeyDown={onKeyDown}
              data-name={"grid-root"}
            >
              <CellMeasure setRowHeight={setRowHeight} />
              <Scrollable
                scrollLeft={scrollLeft}
                scrollTop={scrollTop}
                setScrollLeft={setScrollLeft}
                setScrollTop={setScrollTop}
                scrollerRef={scrollableRef}
                topRef={topRef}
                rightRef={rightRef}
                bottomRef={bottomRef}
                leftRef={leftRef}
                middleRef={middleRef}
              />
              <MiddlePart
                middleRef={middleRef}
                onWheel={onWheel}
                columns={bodyVisibleColumns}
                rows={rows}
                hoverOverRowKey={hoverRowKey}
                setHoverOverRowKey={setHoverRowKey}
                midGap={midGap}
              />
              <TopPart
                columns={headVisibleColumns}
                columnGroups={visColGrps}
                topRef={topRef}
                onWheel={onWheel}
                midGap={midGap}
              />
              <LeftPart
                leftRef={leftRef}
                onWheel={onWheel}
                columns={leftCols}
                rows={rows}
                isRaised={isLeftRaised}
                hoverOverRowKey={hoverRowKey}
                setHoverOverRowKey={setHoverRowKey}
              />
              <RightPart
                rightRef={rightRef}
                onWheel={onWheel}
                columns={rightCols}
                rows={rows}
                isRaised={isRightRaised}
                hoverOverRowKey={hoverRowKey}
                setHoverOverRowKey={setHoverRowKey}
              />
              <TopLeftPart
                onWheel={onWheel}
                columns={leftCols}
                columnGroups={leftGroups}
                isRaised={isLeftRaised}
              />
              <TopRightPart
                onWheel={onWheel}
                columns={rightCols}
                columnGroups={rightGroups}
                isRaised={isRightRaised}
              />
            </div>
          </SizingContext.Provider>
        </SelectionContext.Provider>
      </LayoutContext.Provider>
    </TableContext.Provider>
  );
};
