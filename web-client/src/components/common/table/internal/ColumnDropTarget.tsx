import { useMemo } from "react";
import "./ColumnDropTarget.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";

const withBaseName = makePrefixer("uitkTableColumnDropTarget");

export interface ColumnDropTargetProps {
  x?: number;
}

export function ColumnDropTarget(props: ColumnDropTargetProps) {
  const { x = 0 } = props;

  const style = useMemo(() => {
    return {
      left: `${x}px`,
    };
  }, [x]);

  if (props.x === undefined) {
    return null;
  }

  return <div className={withBaseName()} style={style} />;
}
