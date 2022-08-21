import { useState } from "react";
import { RowSelCheckHeaderCell } from "./RowSelCheckHeaderCell";
import { RowSelectionCheckboxCellValue } from "./RowSelectionCheckboxCellValue";
import { TableColumn, TableColumnProps } from "./TableColumn";

export type RowSelectionColumnProps = Omit<TableColumnProps, "width" | "name">;

export const RowSelectionColumn = (props: RowSelectionColumnProps) => {
  // const [width, setWidth] = useState<number>(100);
  // const onWidthChanged = (width: number) => setWidth(width);
  return (
    <TableColumn
      {...props}
      defaultWidth={100}
      // onWidthChanged={onWidthChanged}
      headerComponent={RowSelCheckHeaderCell}
      cellValueComponent={RowSelectionCheckboxCellValue}
    />
  );
};
