import { TableColumnInfo } from "./TableColumn";
import { createContext, useContext } from "react";
import { ColumnGroupProps } from "./ColumnGroup";

export interface TableContext<T> {
  onColumnAdded: (columnInfo: TableColumnInfo<T>) => void;
  onColumnRemoved: (columnInfo: TableColumnInfo<T>) => void;
  onColumnGroupAdded: (colGroupProps: ColumnGroupProps) => void;
  onColumnGroupRemoved: (colGroupProps: ColumnGroupProps) => void;
}

export const TableContext = createContext<TableContext<any> | undefined>(
  undefined
);

export const useTableContext = () => {
  const c = useContext(TableContext);
  if (!c) {
    throw new Error(`useTableContext invoked outside of a Table`);
  }
  return c;
};
