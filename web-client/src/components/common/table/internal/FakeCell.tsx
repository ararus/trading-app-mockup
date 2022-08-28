import { TableCellProps } from "../TableColumn";
import "./FakeCell.css";

export type FakeCellProps<T> = Pick<TableCellProps<T>, "row">;

export function FakeCell<T>(props: FakeCellProps<T>) {
  const { row } = props;
  return (
    <td
      className={"uitkTableFakeCell"}
      data-row-index={row.index}
      data-column-index={-1}
    />
  );
}
