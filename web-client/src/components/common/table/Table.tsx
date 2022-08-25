import React, {
  KeyboardEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  WheelEventHandler,
} from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { TableColumnInfo } from "./TableColumn";
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
  useColumnRange,
  useColumnRegistry,
  useColumnResize,
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
import { LayoutContext } from "./LayoutContext";
import { EditorContext } from "./EditorContext"; // TODO remove

const withBaseName = makePrefixer("uitkTable");

export type ColumnSeparatorType = "regular" | "none" | "groupEdge";
export type ColumnGroupRowSeparatorType = "first" | "regular" | "last";
export type ColumnGroupColumnSeparatorType = "regular" | "none";

export interface TableProps {
  children: ReactNode;
  zebra?: boolean;
  columnSeparators?: boolean;
  rowData: any[];
  rowKeyGetter: (row: any) => string;
  defaultSelectedRowKeys?: Set<string>;
  className?: string;
  variant?: "primary" | "secondary";
}

export interface TableRowModel {
  key: string;
  index: number;
  data: any;
}

export interface TableColumnModel {
  index: number;
  separator: ColumnSeparatorType;

  info: TableColumnInfo;
}

export interface TableColumnGroupModel {
  index: number;
  data: ColumnGroupProps;
  childrenIds: string[];
  rowSeparator: ColumnGroupRowSeparatorType;
  columnSeparator: ColumnGroupColumnSeparatorType;
  colSpan: number;
}

export const Table = (props: TableProps) => {
  const {
    rowData,
    zebra,
    columnSeparators,
    className,
    rowKeyGetter,
    children,
    defaultSelectedRowKeys,
    variant = "primary",
  } = props;

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

  const [scrollSource, setScrollSource] = useState<"user" | "table">("user");
  const [scrollLeft, setScrollLeft] = useState<number>(0);
  const [scrollTop, setScrollTop] = useState<number>(0);

  const [hoverRowKey, setHoverRowKey] = useState<string | undefined>(undefined);

  const [clientWidth, setClientWidth] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);

  const [selRowKeys, setSelRowKeys] = useState<Set<string>>(
    defaultSelectedRowKeys || new Set()
  );
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

  const [editMode, setEditMode] = useState<boolean>(false);
  const [editorText, setEditorText] = useState<string>("");

  const rowIdxByKey = useRowIdxByKey(rowKeyGetter, rowData);

  const {
    leftCols,
    midCols,
    rightCols,
    leftGroups,
    midGroups,
    rightGroups,
    contextValue,
  } = useColumnRegistry(children);

  const midColsById = useMemo(
    () =>
      new Map<string, TableColumnModel>(
        midCols.map((c) => [c.info.props.id, c])
      ),
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
  const midGap = Math.max(0, Math.floor(clientMidWidth - midWidth));

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

  const cols = useMemo(
    () => [...leftCols, ...midCols, ...rightCols],
    [leftCols, midCols, rightCols]
  );

  const colIdxByKey = useMemo(
    () =>
      new Map<string, number>(cols.map((c, i) => [c.info.props.id, c.index])),
    [cols]
  );

  const cursorColIdx =
    cursorColKey === undefined ? 0 : colIdxByKey.get(cursorColKey) || 0;
  const cursorRowIdx =
    cursorRowKey === undefined ? 0 : rowIdxByKey.get(cursorRowKey) || 0;

  const scroll = useCallback(
    (left?: number, top?: number, source?: "user" | "table") => {
      setScrollSource(source || "user");
      if (left !== undefined) {
        setScrollLeft(left);
      }
      if (top !== undefined) {
        setScrollTop(top);
      }
    },
    [setScrollLeft, setScrollTop, setScrollSource]
  );

  const scrollToCell = useScrollToCell(
    visRowRng,
    rowHeight,
    clientMidHeight,
    midCols,
    bodyVisColRng,
    clientMidWidth,
    scroll
  );

  const startEditMode = (text?: string) => {
    if (editMode) {
      return;
    }
    const r = rowData[cursorRowIdx];
    const c = cols[cursorColIdx];
    if (c.info.props.editable) {
      const v = c.info.props.getValue!(r);
      setEditorText(text === undefined ? v : text);
      setEditMode(true);
    }
  };

  const endEditMode = () => {
    if (!editMode) {
      return;
    }
    const c = cols[cursorColIdx];
    const handler = c.info.props.onChange;
    const rowKey = cursorRowKey;
    if (rowKey === undefined) {
      console.error(`endEditMode: cursorRowKey is undefined in edit mode`);
      return;
    }
    if (!handler) {
      console.warn(
        `onChange is not specified for editable column "${c.info.props.id}".`
      );
      return;
    }
    handler(rowKey, cursorRowIdx, editorText);
    setEditMode(false);
    if (rootRef.current) {
      rootRef.current.focus();
    }
  };

  const cancelEditMode = () => {
    if (!editMode) {
      return;
    }
    setEditMode(false);
    if (rootRef.current) {
      rootRef.current.focus();
    }
  };

  const moveCursor = useCallback(
    (rowIdx: number, colIdx: number) => {
      endEditMode();
      if (rowData.length < 1 || cols.length < 1) {
        return;
      }
      rowIdx = clamp(rowIdx, 0, rowData.length - 1);
      colIdx = clamp(colIdx, 0, cols.length - 1);
      setCursorRowKey(rowKeyGetter(rowData[rowIdx]));
      setCursorColKey(cols[colIdx].info.props.id);
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
      endEditMode,
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
        case "F2":
          startEditMode();
          break;
        default:
          if (
            !editMode &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey &&
            /^[\w\d ]$/.test(event.key)
          ) {
            startEditMode("");
          }
      }
    },
    [cursorRowIdx, cursorColIdx, moveCursor, startEditMode]
  );

  const rows = useRowModels(rowKeyGetter, rowData, visRowRng);

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

  const selectionContext: SelectionContext = useMemo(
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
      col.info.onWidthChanged(width);
    },
    [cols]
  );

  const onResizeHandleMouseDown = useColumnResize(resizeColumn);

  const sizingContext: SizingContext = useMemo(
    () => ({
      resizeColumn,
      rowHeight,
      onResizeHandleMouseDown,
    }),
    [resizeColumn, rowHeight, onResizeHandleMouseDown]
  );

  const layoutContext: LayoutContext = useMemo(
    () => ({
      totalHeight,
      totalWidth,
      clientWidth,
      clientHeight,
    }),
    [totalHeight, totalWidth]
  );

  const editorContext: EditorContext = useMemo(
    () => ({
      editMode,
      editorText,
      setEditorText,
      startEditMode,
      endEditMode,
      cancelEditMode,
    }),
    [
      editMode,
      editorText,
      setEditorText,
      startEditMode,
      endEditMode,
      cancelEditMode,
    ]
  );

  // console.log(
  //   cols.map((c) => `"${c.info.props.name}": ${c.info.width}`).join("\n")
  // );

  return (
    <TableContext.Provider value={contextValue}>
      <LayoutContext.Provider value={layoutContext}>
        <SelectionContext.Provider value={selectionContext}>
          <SizingContext.Provider value={sizingContext}>
            <EditorContext.Provider value={editorContext}>
              {props.children}
              <div
                className={cx(
                  withBaseName(),
                  {
                    [withBaseName("zebra")]: zebra,
                    [withBaseName("columnSeparators")]: columnSeparators,
                    [withBaseName("primaryBackground")]: variant === "primary",
                    [withBaseName("secondaryBackground")]:
                      variant === "secondary",
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
                  scrollSource={scrollSource}
                  scroll={scroll}
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
                  zebra={zebra}
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
                  zebra={zebra}
                />
                <RightPart
                  rightRef={rightRef}
                  onWheel={onWheel}
                  columns={rightCols}
                  rows={rows}
                  isRaised={isRightRaised}
                  hoverOverRowKey={hoverRowKey}
                  setHoverOverRowKey={setHoverRowKey}
                  zebra={zebra}
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
            </EditorContext.Provider>
          </SizingContext.Provider>
        </SelectionContext.Provider>
      </LayoutContext.Provider>
    </TableContext.Provider>
  );
};
