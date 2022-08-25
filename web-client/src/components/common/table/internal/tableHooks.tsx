import React, {
  Children,
  isValidElement,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  TableColumnGroupModel,
  TableColumnModel,
  TableRowModel,
} from "../Table";
import { ColumnGroupProps } from "../ColumnGroup";
import { Rng } from "../Rng";
import { TableColumnInfo, TableColumnPin } from "../TableColumn";
import { getAttribute, makeMapAdder, makeMapDeleter } from "./utils";
import { TableContext } from "../TableContext";

const sumWidth = (columns: TableColumnModel[]) =>
  columns.reduce((p, x) => p + x.info.width, 0);

export const useSumWidth = (columns: TableColumnModel[]) =>
  useMemo(() => sumWidth(columns), [columns]);

export const useSum = (source: number[]) =>
  useMemo(() => source.reduce((p, x) => p + x, 0), source);

const sumRangeWidth = (columns: TableColumnModel[], range: Rng) => {
  let w = 0;
  range.forEach((i) => {
    w += columns[i].info.width;
  });
  return w;
};

export const useSumRangeWidth = (columns: TableColumnModel[], range: Rng) =>
  useMemo(() => sumRangeWidth(columns, range), [columns, range]);

export const useProd = (source: number[]) =>
  useMemo(() => source.reduce((p, x) => p * x, 1), source);

const useMemoRng = (fn: () => Rng, deps: any[]) => {
  const prevRef = useRef<Rng>(Rng.empty);
  const range = useMemo(fn, deps);
  if (!Rng.equals(prevRef.current, range)) {
    prevRef.current = range;
  }
  return prevRef.current;
};

// TODO rewrite this!!!
export const useBodyVisibleColumnRange = (
  midColumns: TableColumnModel[],
  scrollLeft: number,
  clientMidWidth: number
): Rng =>
  useMemoRng(() => {
    if (clientMidWidth === 0 || midColumns.length === 0) {
      return Rng.empty;
    }
    let width = scrollLeft;
    let start = 0;
    for (let i = 0; i < midColumns.length; ++i) {
      const colWidth = midColumns[i].info.width;
      if (width > colWidth) {
        width -= colWidth;
      } else {
        start = i;
        width += clientMidWidth;
        break;
      }
    }
    let end = start + 1;
    for (let i = start; i < midColumns.length; ++i) {
      const colWidth = midColumns[i].info.width;
      width -= colWidth;
      end = i + 1;
      if (width <= 0) {
        break;
      }
    }
    if (end > midColumns.length) {
      end = midColumns.length;
    }
    return new Rng(start, end);
  }, [midColumns, scrollLeft, clientMidWidth]);

export const useClientMidWidth = (
  clientWidth: number,
  leftWidth: number,
  rightWidth: number
) =>
  useMemo(
    () => clientWidth - leftWidth - rightWidth,
    [clientWidth, leftWidth, rightWidth]
  );

export const useClientMidHeight = (
  clientHeight: number,
  topHeight: number,
  botHeight: number
) =>
  useMemo(
    () => clientHeight - topHeight - botHeight,
    [clientHeight, topHeight, botHeight]
  );

export const useBodyVisibleAreaTop = (
  rowHeight: number,
  visibleRowRange: Rng,
  topHeight: number
) =>
  useMemo(
    () => topHeight + visibleRowRange.start * rowHeight,
    [rowHeight, visibleRowRange, topHeight]
  );

export const useVisibleRowRange = (
  scrollTop: number,
  clientMidHeight: number,
  rowHeight: number,
  rowCount: number
) =>
  useMemoRng(() => {
    if (rowHeight < 1) {
      return Rng.empty;
    }
    const start = Math.floor(scrollTop / rowHeight);
    let end = Math.max(
      start,
      Math.ceil((scrollTop + clientMidHeight) / rowHeight)
    );
    if (end > rowCount) {
      end = rowCount;
    }
    return new Rng(start, end);
  }, [scrollTop, clientMidHeight, rowHeight, rowCount]);

export const useColumnRange = (
  columns: TableColumnModel[],
  range: Rng
): TableColumnModel[] =>
  useMemo(() => columns.slice(range.start, range.end), [columns, range]);

export const useLeftScrolledOutWidth = (
  midColumns: TableColumnModel[],
  bodyVisibleColumnRange: Rng
) =>
  useMemo(() => {
    let w = 0;
    for (let i = 0; i < bodyVisibleColumnRange.start; ++i) {
      w += midColumns[i].info.width;
    }
    return w;
  }, [midColumns, bodyVisibleColumnRange]);

export const useRowIdxByKey = (
  rowKeyGetter: (x: any) => string,
  rowData: any[]
) =>
  useMemo(
    () => new Map<string, number>(rowData.map((r, i) => [rowKeyGetter(r), i])),
    [rowData, rowKeyGetter]
  );

export type SetState<T> = (v: T | ((p: T) => T)) => void;

export const useSelectRows = (
  lastSelRowKey: string | undefined,
  setSelRowKeys: SetState<Set<string>>,
  setLastSelRowKey: SetState<string | undefined>,
  rowData: any[],
  rowIdxByKey: Map<string, number>,
  rowKeyGetter: (x: any) => string
) =>
  useCallback(
    (rowIdx: number, shift: boolean, meta: boolean) => {
      const rowKey = rowKeyGetter(rowData[rowIdx]);
      // console.log(
      //   `Selecting row #${rowIdx} ("${rowKey}"); ${shift ? "shift;" : ""}${
      //     meta ? "meta" : ""
      //   }`
      // );
      const idxFrom =
        lastSelRowKey !== undefined && shift
          ? rowIdxByKey.get(lastSelRowKey)
          : undefined;
      if (idxFrom === undefined) {
        // console.log(`Selecting single item "${rowKey}"`);
        if (!meta) {
          setSelRowKeys(new Set<string>([rowKey]));
          setLastSelRowKey(rowKey);
        } else {
          setSelRowKeys((p) => {
            const n = new Set<string>(p);
            if (n.has(rowKey)) {
              n.delete(rowKey);
              setLastSelRowKey(undefined);
            } else {
              n.add(rowKey);
              setLastSelRowKey(rowKey);
            }
            return n;
          });
        }
      } else {
        // console.log(`Selecting range from "${lastSelRowKey}" to "${rowKey}"`);
        setSelRowKeys((p) => {
          const s = meta ? new Set<string>(p) : new Set<string>();
          const idxs = [rowIdxByKey.get(rowKey)!, idxFrom];
          idxs.sort((a, b) => a - b);
          // console.log(`Selecting indices: ${idxs}`);
          const rowKeys = [];
          for (let i = idxs[0]; i <= idxs[1]; ++i) {
            rowKeys.push(rowKeyGetter(rowData[i]));
          }
          if (p.has(rowKey)) {
            rowKeys.forEach((k) => s.delete(k));
          } else {
            rowKeys.forEach((k) => s.add(k));
          }
          return s;
        });
        setLastSelRowKey(rowKey);
      }
    },
    [
      lastSelRowKey,
      setSelRowKeys,
      setLastSelRowKey,
      rowData,
      rowIdxByKey,
      rowKeyGetter,
    ]
  );

export const useRowModels = (
  getKey: (rowData: any) => string,
  rowData: any[],
  visibleRowRange: Rng
) =>
  useMemo(() => {
    const rows: TableRowModel[] = [];
    visibleRowRange.forEach((index) => {
      const key = getKey(rowData[index]);
      rows.push({ data: rowData[index], key, index });
    });
    return rows;
  }, [getKey, rowData, visibleRowRange]);

export const useColumnGroups = (
  grpPs: ColumnGroupProps[],
  startIdx: number
): TableColumnGroupModel[] =>
  useMemo(
    () =>
      grpPs.map((data, i) => {
        const childrenIds = Children.toArray(data.children)
          .map((child) => {
            if (!isValidElement(child)) {
              return undefined;
            }
            return child.props.id;
          })
          .filter((x) => x !== undefined) as string[];
        const colSpan = childrenIds.length;

        return {
          data,
          index: i + startIdx,
          childrenIds,
          colSpan,
          columnSeparator: "regular",
          rowSeparator: "regular",
        };
      }),
    [grpPs, startIdx]
  );
export const PAGE_SIZE = 10;
const scrollBarSize = 15; // TODO
export const useVisibleColumnGroupRange = (
  bodyVisColRng: Rng,
  midCols: TableColumnModel[],
  midGrpByColId: Map<string, TableColumnGroupModel>,
  leftGrpCount: number
): Rng =>
  useMemoRng(() => {
    if (bodyVisColRng.length === 0) {
      return Rng.empty;
    }
    const firstVisibleCol = midCols[bodyVisColRng.start];
    const lastVisibleCol = midCols[bodyVisColRng.end - 1];
    const firstVisibleGroup = midGrpByColId.get(firstVisibleCol.info.props.id);
    const lastVisibleGroup = midGrpByColId.get(lastVisibleCol.info.props.id);
    if (!firstVisibleGroup || !lastVisibleGroup) {
      return Rng.empty;
    }
    return new Rng(
      firstVisibleGroup.index - leftGrpCount,
      lastVisibleGroup.index + 1 - leftGrpCount
    );
  }, [bodyVisColRng, midCols, midGrpByColId, leftGrpCount]);

export function last<T>(source: T[]): T {
  return source[source.length - 1];
}

export const useHeadVisibleColumnRange = (
  bodyVisColRng: Rng,
  visColGrps: TableColumnGroupModel[],
  midColsById: Map<string, TableColumnModel>,
  leftColCount: number
) =>
  useMemoRng(() => {
    if (visColGrps.length === 0) {
      return bodyVisColRng;
    }
    const firstVisibleGroup = visColGrps[0];
    const lastVisibleGroup = last(visColGrps);
    const firstColId = firstVisibleGroup.childrenIds[0];
    const lastColId = last(lastVisibleGroup.childrenIds);
    const firstColIdx = midColsById.get(firstColId)?.index;
    const lastColIdx = midColsById.get(lastColId)?.index;
    if (firstColIdx === undefined || lastColIdx === undefined) {
      return Rng.empty;
    }
    return new Rng(firstColIdx - leftColCount, lastColIdx + 1 - leftColCount);
  }, [bodyVisColRng, visColGrps, midColsById, leftColCount]);

export const useCols = (
  colInfos: TableColumnInfo[],
  startIdx: number,
  groups: TableColumnGroupModel[]
): TableColumnModel[] =>
  useMemo(() => {
    const edgeColIds = new Set<string>();
    groups.forEach((g) => {
      edgeColIds.add(last(g.childrenIds));
    });
    const columnModels: TableColumnModel[] = colInfos.map((info, i) => ({
      info,
      index: i + startIdx,
      separator: edgeColIds.has(info.props.id) ? "groupEdge" : "regular",
    }));
    return columnModels;
  }, [colInfos, startIdx, groups]);

export const useScrollToCell = (
  visRowRng: Rng,
  rowHeight: number,
  clientMidHt: number,
  midCols: TableColumnModel[],
  bodyVisColRng: Rng,
  clientMidWidth: number,
  scroll: (left?: number, top?: number, source?: "user" | "table") => void
) =>
  useCallback(
    (rowIdx: number, colIdx: number) => {
      let x: number | undefined = undefined;
      let y: number | undefined = undefined;
      if (rowIdx <= visRowRng.start) {
        y = rowHeight * rowIdx;
      } else if (rowIdx >= visRowRng.end - 1) {
        y = rowHeight * rowIdx - clientMidHt + rowHeight + scrollBarSize;
      }
      const isMidCol =
        midCols.length > 0 &&
        colIdx >= midCols[0].index &&
        colIdx <= last(midCols).index;
      if (isMidCol) {
        const midColIdx = colIdx - midCols[0].index;
        if (midColIdx <= bodyVisColRng.start) {
          let w = 0;
          for (let i = 0; i < midColIdx; ++i) {
            w += midCols[i].info.width;
          }
          x = w;
        } else if (midColIdx >= bodyVisColRng.end - 1) {
          let w = 0;
          for (let i = 0; i <= midColIdx; ++i) {
            w += midCols[i].info.width;
          }
          x = w - clientMidWidth + scrollBarSize;
        }
      }
      if (x !== undefined || y !== undefined) {
        scroll(x, y, "table");
      }
    },
    [
      visRowRng,
      rowHeight,
      clientMidHt,
      midCols,
      bodyVisColRng,
      clientMidWidth,
      scroll,
    ]
  );

const MIN_COLUMN_WIDTH = 10;

// TODO There might be some problems if column is removed while it is being resized
export function useColumnResize<T>(
  resizeColumn: (columnIndex: number, width: number) => void
) {
  const columnResizeDataRef = useRef<{
    startX: number;
    startY: number;
    eventsUnsubscription: () => void;
    columnIndex: number;
    initialColumnWidth: number;
    resizeColumn: (columnIndex: number, width: number) => void;
  }>();

  const onMouseUp = useCallback(() => {
    columnResizeDataRef.current?.eventsUnsubscription();
    columnResizeDataRef.current = undefined;
  }, []);

  const onMouseMove = useCallback((event: MouseEvent) => {
    const x = event.screenX;
    const { startX, columnIndex, initialColumnWidth } =
      columnResizeDataRef.current!;
    const shift = x - startX;
    let width = initialColumnWidth + shift;
    if (width < MIN_COLUMN_WIDTH) {
      width = MIN_COLUMN_WIDTH;
    }
    columnResizeDataRef.current!.resizeColumn(columnIndex, Math.round(width));
  }, []);

  return useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const targetElement = event.target as HTMLElement;
      const [columnIndexAttribute, thElement] = getAttribute(
        targetElement,
        "data-column-index"
      );

      const columnIndex = parseInt(columnIndexAttribute, 10);

      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("mousemove", onMouseMove);

      const initialColumnWidth = thElement.getBoundingClientRect().width;

      columnResizeDataRef.current = {
        startX: event.screenX,
        startY: event.screenY,
        eventsUnsubscription: () => {
          document.removeEventListener("mouseup", onMouseUp);
          document.removeEventListener("mousemove", onMouseMove);
        },
        columnIndex,
        initialColumnWidth,
        resizeColumn,
      };

      event.preventDefault();
    },
    [resizeColumn]
  );
}

export function useFlatten<T>(map: Map<number, T>): T[] {
  return useMemo(() => {
    const entries = [...map.entries()].filter(([index, value]) => !!value);
    entries.sort((a, b) => a[0] - b[0]);
    return entries.map((x) => x[1]);
  }, [map]);
}

const useColMap = () => useState<Map<number, TableColumnInfo>>(new Map());
const useGrpMap = () => useState<Map<number, ColumnGroupProps>>(new Map());

// Instances of TableColumn and TableColumnGroup register/unregister themselves
// using onColumnAdded, onColumnRemoved, onColumnGroupAdded, onColumnGroupRemoved
// taken from context
// The order of columns/groups is based on the order of "children" (Table.props children)
export const useColumnRegistry = (children: ReactNode) => {
  const [leftColMap, setLeftColMap] = useColMap();
  const [rightColMap, setRightColMap] = useColMap();
  const [midColMap, setMidColMap] = useColMap();

  const [leftGrpMap, setLeftGrpMap] = useGrpMap();
  const [rightGrpMap, setRightGrpMap] = useGrpMap();
  const [midGrpMap, setMidGrpMap] = useGrpMap();

  const leftColInfos = useFlatten(leftColMap);
  const rightColInfos = useFlatten(rightColMap);
  const midColInfos = useFlatten(midColMap);

  const leftGrpPs = useFlatten(leftGrpMap);
  const rightGrpPs = useFlatten(rightGrpMap);
  const midGrpPs = useFlatten(midGrpMap);

  const leftGroups = useColumnGroups(leftGrpPs, 0);
  const midGroups = useColumnGroups(midGrpPs, leftGroups.length);
  const rightGroups = useColumnGroups(
    rightGrpPs,
    leftGroups.length + midGroups.length
  );

  const leftCols: TableColumnModel[] = useCols(leftColInfos, 0, leftGroups);
  const midCols: TableColumnModel[] = useCols(
    midColInfos,
    leftCols.length,
    midGroups
  );
  const rightCols: TableColumnModel[] = useCols(
    rightColInfos,
    leftCols.length + midCols.length,
    rightGroups
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

  const getColMapSet = (pinned?: TableColumnPin) =>
    pinned === "left"
      ? setLeftColMap
      : pinned === "right"
      ? setRightColMap
      : setMidColMap;

  const onColumnAdded = useCallback((columnInfo: TableColumnInfo) => {
    // console.log(
    //   `Column added: "${columnInfo.props.name}"; pinned: ${columnInfo.props.pinned}`
    // );
    const { id, pinned } = columnInfo.props;
    getColMapSet(pinned)(makeMapAdder(getChildIndex(id), columnInfo));
  }, []);

  const onColumnRemoved = useCallback((columnInfo: TableColumnInfo) => {
    const { id, pinned } = columnInfo.props;
    getColMapSet(pinned)(makeMapDeleter(getChildIndex(id)));
    // console.log(`Column removed: "${columnProps.name}"`);
  }, []);

  const getGrpMapSet = (pinned?: TableColumnPin) =>
    pinned === "left"
      ? setLeftGrpMap
      : pinned === "right"
      ? setRightGrpMap
      : setMidGrpMap;

  const onColumnGroupAdded = useCallback((colGroupProps: ColumnGroupProps) => {
    const { id, pinned } = colGroupProps;
    getGrpMapSet(pinned)(makeMapAdder(getChildIndex(id), colGroupProps));
    // console.log(`Group added: "${colGroupProps.name}"`);
  }, []);

  const onColumnGroupRemoved = useCallback(
    (colGroupProps: ColumnGroupProps) => {
      const { id, pinned } = colGroupProps;
      getGrpMapSet(pinned)(makeMapDeleter(getChildIndex(id)));
      // console.log(`Group removed: "${colGroupProps.name}"`);
    },
    []
  );

  const contextValue: TableContext = useMemo(
    () => ({
      onColumnAdded,
      onColumnRemoved,
      onColumnGroupAdded,
      onColumnGroupRemoved,
    }),
    [onColumnAdded, onColumnRemoved, onColumnGroupAdded, onColumnGroupRemoved]
  );

  return {
    leftCols,
    midCols,
    rightCols,
    leftGroups,
    midGroups,
    rightGroups,
    contextValue,
  };
};
