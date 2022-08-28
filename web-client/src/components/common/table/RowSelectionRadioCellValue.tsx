import { makePrefixer, RadioIcon } from "@jpmorganchase/uitk-core";
import { TableCellValueProps } from "./TableColumn";
import { useSelectionContext } from "./SelectionContext";
import { MouseEventHandler } from "react";
import "./RowSelectionRadioCellValue.css";

const withBaseName = makePrefixer("uitkTableRowSelectionCheckboxCellValue");

export function RowSelectionRadioCellValue<T>(props: TableCellValueProps<T>) {
  const { row } = props;
  const { selRowKeys, selectRows } = useSelectionContext();

  const isSelected = selRowKeys.has(row.key);
  const onMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    selectRows(row.index, false, false);
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className={withBaseName()} onMouseDown={onMouseDown}>
      <RadioIcon checked={isSelected} />
    </div>
  );
}
