import React, {
  CSSProperties,
  forwardRef,
  Fragment,
  MouseEventHandler,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import "./GridList.css";
import cn from "classnames";
import { getAttribute } from "../../utils/getAttribute";
import { observer } from "mobx-react-lite";

export interface IGridListCellProps<T> {
  rowIndex: number;
  dataItem: T;
}

export interface IGridListColumn<T> {
  header: React.ReactNode;
  cellComponent: React.ComponentType<IGridListCellProps<T>>;
  textAlign?: "left" | "right";
  width: string;
}

export interface IGridListProps<T> {
  data: T[];
  columns: IGridListColumn<T>[];
  onRowClick?: (rowIndex: number) => void;
  className?: string;
  showHeader?: boolean;
}

const withBaseName = makePrefixer("tamGridList");

interface IHeaderCellProps {
  children: React.ReactNode;
  column: IGridListColumn<any>;
}

const HeaderCell = forwardRef<HTMLDivElement, IHeaderCellProps>(
  (props, ref) => {
    return (
      <div
        ref={ref}
        style={{}}
        className={cn(withBaseName("headerCell"), {
          [withBaseName("alignRight")]: props.column.textAlign === "right",
        })}
      >
        {props.children}
      </div>
    );
  }
);

interface ICellProps {
  isHoverOver: boolean;
  rowIndex: number;
  children: ReactNode;
}

const Cell = forwardRef<HTMLDivElement, ICellProps>((props, ref) => {
  return (
    <div
      ref={ref}
      data-row-index={props.rowIndex}
      className={cn(withBaseName("cell"), {
        [withBaseName("hover")]: props.isHoverOver,
      })}
    >
      {props.children}
    </div>
  );
});

export const GridList = observer(function GridList<T>(
  props: IGridListProps<T>
) {
  const { data, columns, className, showHeader = true } = props;
  const columnCount = columns.length;

  const [cellRefs, headerRefs] = useMemo(() => {
    const cellRefs = [...Array(columnCount).keys()].map((_) =>
      React.createRef<HTMLDivElement>()
    );
    const headerRefs = [...Array(columnCount).keys()].map((_) =>
      React.createRef<HTMLDivElement>()
    );
    return [cellRefs, headerRefs];
  }, [columnCount]);

  const contentStyle: CSSProperties = useMemo(() => {
    return {
      gridTemplateColumns: columns
        .map((column) => {
          return column.width;
        })
        .join(" "),
    };
  }, [columns]);

  useEffect(() => {
    const isBodyRendered = headerRefs.every((r) => !!r.current);
    if (isBodyRendered) {
      for (let i = 0; i < columnCount; ++i) {
        headerRefs[i].current!.style.width = `${
          cellRefs[i].current!.clientWidth
        }px`;
      }
    }
  });

  const [hoverRowIndex, setHoverRowIndex] = useState<number | undefined>(
    undefined
  );

  const onMouseMove: MouseEventHandler<HTMLDivElement> = (event) => {
    const [a] = getAttribute(event.target as HTMLElement, "data-row-index");
    const rowIndex = parseInt(a, 10);
    setHoverRowIndex(rowIndex);
  };

  const onMouseLeave: MouseEventHandler<HTMLDivElement> = (event) => {
    setHoverRowIndex(undefined);
  };

  const onClick: MouseEventHandler<HTMLDivElement> = (event) => {
    const [a] = getAttribute(event.target as HTMLElement, "data-row-index");
    const rowIndex = parseInt(a, 10);
    if (props.onRowClick) {
      props.onRowClick(rowIndex);
    }
  };

  return (
    <div className={cn(withBaseName(), className)}>
      {showHeader ? (
        <div className={withBaseName("header")}>
          {columns.map((column, columnIndex) => {
            return (
              <HeaderCell
                key={columnIndex}
                ref={headerRefs[columnIndex]}
                column={column}
              >
                {column.header}
              </HeaderCell>
            );
          })}
        </div>
      ) : null}
      <div className={withBaseName("body")}>
        <div
          className={withBaseName("contentContainer")}
          style={contentStyle}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
        >
          {columns.map((column, columnIndex) => {
            return (
              <div key={`Measure_${columnIndex}`} ref={cellRefs[columnIndex]} />
            );
          })}
          {showHeader
            ? columns.map((column, columnIndex) => {
                return (
                  <HeaderCell key={columnIndex} column={column}>
                    {column.header}
                  </HeaderCell>
                );
              })
            : null}
          {data.map((dataItem, rowIndex) => {
            return (
              <Fragment key={rowIndex}>
                {columns.map((column, columnIndex) => {
                  const CellComponent = column.cellComponent;
                  return (
                    <Cell
                      rowIndex={rowIndex}
                      key={[rowIndex, columnIndex].join("_")}
                      isHoverOver={rowIndex === hoverRowIndex}
                    >
                      <CellComponent rowIndex={rowIndex} dataItem={dataItem} />
                    </Cell>
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
});
