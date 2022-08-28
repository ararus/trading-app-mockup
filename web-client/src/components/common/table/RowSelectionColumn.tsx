import { RowSelCheckHeaderCell } from "./RowSelCheckHeaderCell";
import { RowSelectionCheckboxCellValue } from "./RowSelectionCheckboxCellValue";
import { TableColumn, TableColumnProps } from "./TableColumn";

export type RowSelectionColumnProps<T> = Omit<
  TableColumnProps<T>,
  "width" | "name"
>;

export function RowSelectionColumn<T>(props: RowSelectionColumnProps<T>) {
  return (
    <TableColumn
      {...props}
      defaultWidth={100}
      headerComponent={RowSelCheckHeaderCell}
      cellValueComponent={RowSelectionCheckboxCellValue}
      pinned="left"
    />
  );
}
