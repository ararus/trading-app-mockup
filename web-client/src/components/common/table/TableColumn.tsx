import {
  ComponentType,
  CSSProperties,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useTableContext } from "./TableContext";
import { TableColumnModel, TableRowModel } from "./Table";
import { HeaderCellProps } from "./HeaderCell";

export type TableColumnPin = "left" | "right" | null;

export interface TableCellProps<T> {
  row: TableRowModel<T>;
  column: TableColumnModel<T>;
  className?: string;
  style?: CSSProperties;
  isFocused?: boolean;
  children?: ReactNode;
}

export interface TableCellValueProps<T> {
  row: TableRowModel<T>;
  column: TableColumnModel<T>;
  value?: T;
}

export interface TableHeaderValueProps<T> {
  column: TableColumnModel<T>;
}

export interface TableEditorProps {
  // TODO
}

export interface TableColumnProps<T> {
  id: string;
  name?: string;
  defaultWidth?: number;
  onWidthChanged?: (width: number) => void;
  pinned?: TableColumnPin;
  align?: "left" | "right";
  cellComponent?: ComponentType<TableCellProps<T>>;
  cellValueComponent?: ComponentType<TableCellValueProps<T>>;
  getValue?: (rowData: T) => any;
  headerClassName?: string;
  headerComponent?: ComponentType<HeaderCellProps<T>>;
  headerValueComponent?: ComponentType<TableHeaderValueProps<T>>;
  editable?: boolean;
  editorComponent?: ComponentType<TableEditorProps>;
  onChange?: (rowKey: string, rowIndex: number, value: string) => void;
}

export interface TableColumnInfo<T> {
  width: number;
  onWidthChanged: (width: number) => void;
  props: TableColumnProps<T>;
}

export function TableColumn<T>(props: TableColumnProps<T>) {
  const { defaultWidth } = props;
  const [width, setWidth] = useState<number>(
    defaultWidth !== undefined ? defaultWidth : 100
  );

  const onWidthChanged = (w: number) => {
    setWidth(w);
    if (props.onWidthChanged) {
      props.onWidthChanged(w);
    }
  };

  const table = useTableContext();
  const info: TableColumnInfo<T> = {
    width,
    onWidthChanged,
    props,
  };

  useEffect(() => {
    table.onColumnAdded(info);
    return () => {
      table.onColumnRemoved(info);
    };
  });

  return null;
}
