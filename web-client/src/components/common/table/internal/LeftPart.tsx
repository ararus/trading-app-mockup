import cn from "classnames";
import { TableColGroup } from "./TableColGroup";
import { TableBody } from "./TableBody";
import { RefObject, WheelEventHandler } from "react";
import "./LeftPart.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { TableColumnModel, TableRowModel } from "../Table";

const withBaseName = makePrefixer("uitkTableLeftPart");

export interface LeftPartProps<T> {
  leftRef: RefObject<HTMLDivElement>;
  onWheel: WheelEventHandler<HTMLTableElement>;
  isRaised?: boolean;
  columns: TableColumnModel<T>[];
  rows: TableRowModel<T>[];
  hoverOverRowKey?: string;
  setHoverOverRowKey: (key: string | undefined) => void;
  zebra?: boolean;
}

export function LeftPart<T>(props: LeftPartProps<T>) {
  const {
    leftRef,
    onWheel,
    isRaised,
    columns,
    rows,
    hoverOverRowKey,
    setHoverOverRowKey,
    zebra,
  } = props;

  return (
    <div
      ref={leftRef}
      className={cn(withBaseName(), {
        [withBaseName("raised")]: isRaised,
      })}
    >
      <div className={withBaseName("space")}>
        <table onWheel={onWheel}>
          <TableColGroup columns={columns} />
          <TableBody
            columns={columns}
            rows={rows}
            hoverRowKey={hoverOverRowKey}
            setHoverRowKey={setHoverOverRowKey}
            zebra={zebra}
          />
        </table>
      </div>
    </div>
  );
}
