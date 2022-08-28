import {
  ChangeEventHandler,
  FC,
  FocusEventHandler,
  KeyboardEventHandler,
} from "react";
import "./CellEditor.css";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { useEditorContext } from "./EditorContext";

const withBaseName = makePrefixer("uitkTableCellEditor");

export interface CellEditorProps {}

export const CellEditor: FC<CellEditorProps> = (props) => {
  const { editorText, setEditorText, endEditMode, cancelEditMode } =
    useEditorContext();

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setEditorText(e.target.value);
  };

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      endEditMode();
    }
    if (event.key === "Escape") {
      cancelEditMode();
    }
    event.stopPropagation();
  };

  const onBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    console.log(`input onBlur`);
    // debugger;
  };

  return (
    <td className={withBaseName()}>
      <input
        autoFocus={true}
        value={editorText}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
      />
    </td>
  );
};
