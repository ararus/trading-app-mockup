import { RowSelectionRadioCellValue } from "./RowSelectionRadioCellValue";
import { TableColumn, TableColumnProps } from "./TableColumn";
import { RowSelectionRadioHeaderCell } from "./RowSelectionRadioHeaderCell";

export type RowSelectionRadioColumnProps<T> = Omit<
  TableColumnProps<T>,
  "width" | "name"
>;

export function RowSelectionRadioColumn<T>(
  props: RowSelectionRadioColumnProps<T>
) {
  return (
    <TableColumn
      {...props}
      defaultWidth={100}
      headerComponent={RowSelectionRadioHeaderCell}
      cellValueComponent={RowSelectionRadioCellValue}
      pinned="left"
    />
  );
}
