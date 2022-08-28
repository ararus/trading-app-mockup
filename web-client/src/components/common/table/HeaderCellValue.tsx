import { makePrefixer } from "@jpmorganchase/uitk-core";
import { TableHeaderValueProps } from "./TableColumn";

const withBaseName = makePrefixer("uitkTableHeaderCell");

export function HeaderCellValue<T>(props: TableHeaderValueProps<T>) {
  const { column } = props;
  const title = column.info.props.name;
  return <span className={withBaseName("text")}>{title}</span>;
}
