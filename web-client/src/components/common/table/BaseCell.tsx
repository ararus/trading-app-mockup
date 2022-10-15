import cn from "classnames";
import "./BaseCell.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { TableCellProps } from "./TableColumn";
import { TableColumnModel } from "./Table";

const withBaseName = makePrefixer("uitkTableBaseCell");

export function getCellId<T>(rowKey: string, column: TableColumnModel<T>) {
  return `R${rowKey}C${column.info.props.id}`;
}

export function BaseCell<T>(props: TableCellProps<T>) {
  const { column, className, row, style, isFocused, children } = props;
  return (
    <td
      id={getCellId(row.key, column)}
      data-row-index={row.index}
      data-column-index={column.index}
      aria-colindex={column.index}
      role="gridcell"
      className={cn(withBaseName(), className)}
      style={style}
    >
      <div
        className={cn(withBaseName("valueContainer"), {
          [withBaseName("focused")]: isFocused,
          [withBaseName("editable")]: !isFocused && column.info.props.editable,
        })}
      >
        {children}
      </div>
    </td>
  );
}
