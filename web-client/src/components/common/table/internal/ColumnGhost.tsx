import { CSSProperties } from "react";
import "./ColumnGhost.css";
import { TableColGroup } from "./TableColGroup";
import { HeaderRow } from "./HeaderRow";
import { TableBody } from "./TableBody";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { ColumnDragState } from "./tableHooks";
import { TableColumnModel, TableRowModel } from "../Table";

const withBaseName = makePrefixer("uitkTableColumnGhost");

export interface ColumnGhostProps<T> {
  dragState?: ColumnDragState;
  columns: TableColumnModel<T>[];
  rows: TableRowModel<T>[];
}

export function ColumnGhost<T = any>(props: ColumnGhostProps<T>) {
  if (!props.dragState) {
    return null;
  }

  const { columnIndex, x, y } = props.dragState;
  const { columns, rows } = props;
  const movingColumn = columns[columnIndex];

  // console.log(`ColumnGhost renders column ${columnIndex}`);

  const style: CSSProperties = {
    left: x,
    top: y,
  };

  return (
    <div className={withBaseName()} style={style}>
      <table>
        <TableColGroup columns={[movingColumn]} />
        <thead>
          <HeaderRow columns={[movingColumn]} />
        </thead>
        <TableBody
          columns={[movingColumn]}
          rows={rows}
          setHoverRowKey={() => {}}
        />
      </table>
    </div>
  );
}
