import { FC } from "react";
import { TableCellProps } from "../TableColumn";

export type FakeCellProps = Pick<TableCellProps, "row">;
export const FakeCell: FC<FakeCellProps> = function FakeCell(props) {
  const { row } = props;
  return <td data-row-index={row.index} data-column-index={-1}></td>;
};
