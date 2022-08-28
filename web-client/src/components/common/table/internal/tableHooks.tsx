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
  RowKeyGetter,
  TableColumnGroupModel,
  TableColumnModel,
  TableRowModel,
  TableRowSelectionMode,
} from "../Table";
import { ColumnGroupProps } from "../ColumnGroup";
import { Rng } from "../Rng";
import { TableColumnInfo, TableColumnPin } from "../TableColumn";
import { getAttribute, makeMapAdder, makeMapDeleter } from "./utils";
import { TableContext } from "../TableContext";
import { SelectionContext } from "../SelectionContext";

function sumWidth<T>(columns: TableColumnModel<T>[]) {
  return columns.reduce((p, x) => p + x.info.width, 0);
}

export function useSumWidth<T>(columns: TableColumnModel<T>[]) {
  return useMemo(() => sumWidth(columns), [columns]);
}

export function useSum(source: number[]) {
  return useMemo(() => source.reduce((p, x) => p + x, 0), source);
}

function sumRangeWidth<T>(columns: TableColumnModel<T>[], range: Rng) {
  let w = 0;
  range.forEach((i) => {
    w += columns[i].info.width;
  });
  return w;
}

export function useSumRangeWidth<T>(
  columns: TableColumnModel<T>[],
  range: Rng
) {
  return useMemo(() => sumRangeWidth(columns, range), [columns, range]);
}

export function useProd(source: number[]) {
  return useMemo(() => source.reduce((p, x) => p * x, 1), source);
}

function useMemoRng(fn: () => Rng, deps: any[]) {
  const prevRef = useRef<Rng>(Rng.empty);
  const range = useMemo(fn, deps);
  if (!Rng.equals(prevRef.current, range)) {
    prevRef.current = range;
  }
  return prevRef.current;
}

// TODO rewrite this!!!
export function useBodyVisibleColumnRange<T>(
  midColumns: TableColumnModel<T>[],
  scrollLeft: number,
  clientMidWidth: number
): Rng {
  return useMemoRng(() => {
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
}

export function useClientMidWidth(
  clientWidth: number,
  leftWidth: number,
  rightWidth: number
) {
  return useMemo(
    () => clientWidth - leftWidth - rightWidth,
    [clientWidth, leftWidth, rightWidth]
  );
}

export function useClientMidHeight(
  clientHeight: number,
  topHeight: number,
  botHeight: number
) {
  return useMemo(
    () => clientHeight - topHeight - botHeight,
    [clientHeight, topHeight, botHeight]
  );
}

export function useBodyVisibleAreaTop<T>(
  rowHeight: number,
  visibleRowRange: Rng,
  topHeight: number
) {
  return useMemo(
    () => topHeight + visibleRowRange.start * rowHeight,
    [rowHeight, visibleRowRange, topHeight]
  );
}

export function useVisibleRowRange(
  scrollTop: number,
  clientMidHeight: number,
  rowHeight: number,
  rowCount: number
) {
  return useMemoRng(() => {
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
}

export function useColumnRange<T>(
  columns: TableColumnModel<T>[],
  range: Rng
): TableColumnModel<T>[] {
  return useMemo(() => columns.slice(range.start, range.end), [columns, range]);
}

export function useLeftScrolledOutWidth<T>(
  midColumns: TableColumnModel<T>[],
  bodyVisibleColumnRange: Rng
) {
  return useMemo(() => {
    let w = 0;
    for (let i = 0; i < bodyVisibleColumnRange.start; ++i) {
      w += midColumns[i].info.width;
    }
    return w;
  }, [midColumns, bodyVisibleColumnRange]);
}

export function useRowIdxByKey<T>(rowKeyGetter: RowKeyGetter<T>, rowData: T[]) {
  return useMemo(
    () =>
      new Map<string, number>(rowData.map((r, i) => [rowKeyGetter(r, i), i])),
    [rowData, rowKeyGetter]
  );
}

export type SetState<T> = (v: T | ((p: T) => T)) => void;

export function useRowModels<T>(
  getKey: RowKeyGetter<T>,
  rowData: T[],
  visibleRowRange: Rng
) {
  return useMemo(() => {
    const rows: TableRowModel<T>[] = [];
    visibleRowRange.forEach((i) => {
      const key = getKey(rowData[i], i);
      rows.push({ data: rowData[i], key, index: i });
    });
    return rows;
  }, [getKey, rowData, visibleRowRange]);
}

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

export function useVisibleColumnGroupRange<T>(
  bodyVisColRng: Rng,
  midCols: TableColumnModel<T>[],
  midGrpByColId: Map<string, TableColumnGroupModel>,
  leftGrpCount: number
): Rng {
  return useMemoRng(() => {
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
}

export function last<T>(source: T[]): T {
  return source[source.length - 1];
}

export function useHeadVisibleColumnRange<T>(
  bodyVisColRng: Rng,
  visColGrps: TableColumnGroupModel[],
  midColsById: Map<string, TableColumnModel<T>>,
  leftColCount: number
) {
  return useMemoRng(() => {
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
}

export function useCols<T>(
  colInfos: TableColumnInfo<T>[],
  startIdx: number,
  groups: TableColumnGroupModel[]
): TableColumnModel<T>[] {
  return useMemo(() => {
    const edgeColIds = new Set<string>();
    groups.forEach((g) => {
      edgeColIds.add(last(g.childrenIds));
    });
    const columnModels: TableColumnModel<T>[] = colInfos.map((info, i) => ({
      info,
      index: i + startIdx,
      separator: edgeColIds.has(info.props.id) ? "groupEdge" : "regular",
    }));
    return columnModels;
  }, [colInfos, startIdx, groups]);
}

export function useScrollToCell<T>(
  visRowRng: Rng,
  rowHeight: number,
  clientMidHt: number,
  midCols: TableColumnModel<T>[],
  bodyVisColRng: Rng,
  clientMidWidth: number,
  scroll: (left?: number, top?: number, source?: "user" | "table") => void
) {
  return useCallback(
    (rowIdx: number, colIdx: number) => {
      let x: number | undefined = undefined;
      let y: number | undefined = undefined;
      if (rowIdx <= visRowRng.start) {
        y = rowHeight * rowIdx;
      } else if (rowIdx >= visRowRng.end - 1) {
        y = Math.max(0, rowHeight * rowIdx - clientMidHt + rowHeight);
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
          x = w - clientMidWidth;
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
}

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

function useColMap<T>() {
  return useState<Map<number, TableColumnInfo<T>>>(new Map());
}

function useGrpMap() {
  return useState<Map<number, ColumnGroupProps>>(new Map());
}

// Instances of TableColumn and TableColumnGroup register/unregister themselves
// using onColumnAdded, onColumnRemoved, onColumnGroupAdded, onColumnGroupRemoved
// taken from context
// The order of columns/groups is based on the order of "children" (Table.props children)
export function useColumnRegistry<T>(children: ReactNode) {
  const [leftColMap, setLeftColMap] = useColMap<T>();
  const [rightColMap, setRightColMap] = useColMap<T>();
  const [midColMap, setMidColMap] = useColMap<T>();

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

  const leftCols: TableColumnModel<T>[] = useCols(leftColInfos, 0, leftGroups);
  const midCols: TableColumnModel<T>[] = useCols(
    midColInfos,
    leftCols.length,
    midGroups
  );
  const rightCols: TableColumnModel<T>[] = useCols(
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

  const onColumnAdded = useCallback((columnInfo: TableColumnInfo<T>) => {
    // console.log(
    //   `Column added: "${columnInfo.props.name}"; pinned: ${columnInfo.props.pinned}`
    // );
    const { id, pinned } = columnInfo.props;
    getColMapSet(pinned)(makeMapAdder(getChildIndex(id), columnInfo));
  }, []);

  const onColumnRemoved = useCallback((columnInfo: TableColumnInfo<T>) => {
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

  const contextValue: TableContext<T> = useMemo(
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
}

export function useRowSelection<T>(
  rowKeyGetter: RowKeyGetter<T>,
  rowData: T[],
  rowIdxByKey: Map<string, number>,
  defaultSelectedRowKeys?: Set<string>,
  rowSelectionMode?: TableRowSelectionMode,
  onRowSelected?: (selectedRows: T[]) => void
) {
  const [selRowKeys, setSelRowKeys] = useState<Set<string>>(
    defaultSelectedRowKeys || new Set()
  );

  const [lastSelRowKey, setLastSelRowKey] = useState<string | undefined>(
    undefined
  );

  const selectRows = useCallback(
    (rowIdx: number, shift: boolean, meta: boolean) => {
      const rowKey = rowKeyGetter(rowData[rowIdx], rowIdx);
      const idxFrom =
        rowSelectionMode === "multi" && lastSelRowKey !== undefined && shift
          ? rowIdxByKey.get(lastSelRowKey)
          : undefined;

      let nextSelRowKeys: Set<string> | undefined = undefined;
      let nextLastSelRowKey: string | undefined = undefined;

      if (idxFrom === undefined) {
        if (rowSelectionMode !== "multi" || !meta) {
          nextSelRowKeys = new Set([rowKey]);
          nextLastSelRowKey = rowKey;
        } else {
          const n = new Set<string>(selRowKeys);
          if (n.has(rowKey)) {
            n.delete(rowKey);
            nextLastSelRowKey = undefined;
          } else {
            n.add(rowKey);
            nextLastSelRowKey = rowKey;
          }
          nextSelRowKeys = n;
        }
      } else {
        const s = meta ? new Set<string>(selRowKeys) : new Set<string>();
        const idxs = [rowIdxByKey.get(rowKey)!, idxFrom];
        idxs.sort((a, b) => a - b);
        const rowKeys = [];
        for (let i = idxs[0]; i <= idxs[1]; ++i) {
          rowKeys.push(rowKeyGetter(rowData[i], i));
        }
        if (selRowKeys.has(rowKey)) {
          rowKeys.forEach((k) => s.delete(k));
        } else {
          rowKeys.forEach((k) => s.add(k));
        }
        nextSelRowKeys = s;
        nextLastSelRowKey = rowKey;
      }

      setSelRowKeys(nextSelRowKeys);
      setLastSelRowKey(nextLastSelRowKey);
      if (onRowSelected) {
        onRowSelected(
          [...nextSelRowKeys.keys()].map((k) => rowData[rowIdxByKey.get(k)!])
        );
      }
    },
    [
      lastSelRowKey,
      setSelRowKeys,
      setLastSelRowKey,
      rowData,
      rowIdxByKey,
      rowKeyGetter,
      onRowSelected,
    ]
  );

  const isAllSelected = selRowKeys.size === rowData.length;
  const isAnySelected = selRowKeys.size > 0;

  const selectAll = useCallback(() => {
    setSelRowKeys(new Set(rowData.map((d, i) => rowKeyGetter(d, i))));
    if (onRowSelected) {
      onRowSelected(rowData);
    }
  }, [rowData, setSelRowKeys]);

  const unselectAll = useCallback(() => {
    setSelRowKeys(new Set());
    if (onRowSelected) {
      onRowSelected([]);
    }
  }, [setSelRowKeys]);

  const selectionContext: SelectionContext = useMemo(
    () => ({
      selRowKeys,
      isAllSelected,
      isAnySelected,
      selectRows,
      selectAll,
      unselectAll,
    }),
    [
      selRowKeys,
      selectRows,
      isAllSelected,
      isAnySelected,
      selectAll,
      unselectAll,
    ]
  );

  return selectionContext;
}
