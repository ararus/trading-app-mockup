/* This is obsolete (most likely). TODO remove after review */

import { FC } from "react";
import "./Cursor.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";

const withBaseName = makePrefixer("uitkTableCursor");

export interface CursorProps {}

export const Cursor: FC<CursorProps> = function Cursor(props) {
  return <div className={withBaseName()} />;
};
