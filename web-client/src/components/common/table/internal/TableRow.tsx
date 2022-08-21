import { FC, MouseEventHandler } from "react";
import "./TableRow.css";
import { BaseCell } from "../BaseCell";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import cn from "classnames";
import { TableCellValueProps } from "../TableColumn";
import { TableColumnModel, TableRowModel } from "../Table";
import { FakeCell } from "./FakeCell";

const withBaseName = makePrefixer("uitkTableTableRow");

export interface TableRowProps {
  row: TableRowModel;
  isSelected?: boolean;
  isHoverOver?: boolean;
  isZebra?: boolean;
  columns: TableColumnModel[];
  cursorColKey?: string;
  onMouseEnter?: MouseEventHandler<HTMLTableRowElement>;
  onMouseLeave?: MouseEventHandler<HTMLTableRowElement>;
  gap?: number;
}

const DefaultCellValue: FC<TableCellValueProps> = (props) => {
  const { value } = props;
  return <div>{value}</div>;
};

export const TableRow = function TableRow(props: TableRowProps) {
  const {
    row,
    isSelected,
    isZebra,
    isHoverOver,
    columns,
    onMouseEnter,
    onMouseLeave,
    cursorColKey,
    gap,
  } = props;

  if (!row.key) {
    throw new Error(`Invalid row`);
  }

  // if (row.index === 0) {
  //   console.log(`Row0 price: ${row.data.price}`);
  // }

  return (
    <tr
      className={cn(withBaseName(), {
        [withBaseName("zebra")]: isZebra,
        [withBaseName("hover")]: isHoverOver,
        [withBaseName("selected")]: isSelected,
      })}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-row-index={row.index}
      data-row-key={row.key}
      role="row"
    >
      {columns.map((column, i) => {
        const Cell = column.info.props.cellComponent || BaseCell;
        const CellValue =
          column.info.props.cellValueComponent || DefaultCellValue;
        const value = column.info.props.getValue
          ? column.info.props.getValue(row.data)
          : null;
        const isFocused = cursorColKey === column.info.props.id;
        return (
          <Cell
            key={column.info.props.id}
            row={row}
            column={column}
            isFocused={isFocused}
          >
            <CellValue column={column} row={row} value={value} />
          </Cell>
        );
      })}
      {gap !== undefined && gap > 0 ? <FakeCell row={row} /> : null}
    </tr>
  );
};