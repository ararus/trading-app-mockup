import { createContext, useContext } from "react";

export interface EditorContext {
  editMode?: boolean;
  editorText?: string;
  setEditorText: (text: string) => void;
  startEditMode: () => void;
  endEditMode: () => void;
  cancelEditMode: () => void;
}

export const EditorContext = createContext<EditorContext | undefined>(
  undefined
);
export const useEditorContext = () => {
  const c = useContext(EditorContext);
  if (!c) {
    throw new Error(`useEditorContext invoked outside of a Table`);
  }
  return c;
};
