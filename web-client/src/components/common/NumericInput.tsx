import { FC } from "react";
import { observer } from "mobx-react-lite";
import { FormField, Input, InputProps } from "@jpmorganchase/uitk-core";
import { NumericField } from "../../store";

export type INumericInputProps = Pick<InputProps, "endAdornment"> & {
  field: NumericField;
  label: string;
};
export const NumericInput: FC<INumericInputProps> = observer((props) => {
  const { field, label, endAdornment } = props;

  const onChange = (_: any, input: string) => {
    field.setInput(input);
  };

  const onFocus = () => {
    field.setFocused(true);
  };

  const onBlur = () => {
    field.setFocused(false);
  };

  return (
    <FormField label={label}>
      <Input
        value={field.text}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        endAdornment={endAdornment}
      />
    </FormField>
  );
});
