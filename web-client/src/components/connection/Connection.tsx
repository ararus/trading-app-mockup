import { observer } from "mobx-react-lite";
import { FC } from "react";
import { Switch } from "@jpmorganchase/uitk-core";
import { useStore } from "../../store";

export interface IConnectionProps {}

export const Connection: FC<IConnectionProps> = observer((props) => {
  const { connection } = useStore();
  const onChange = (_: any, checked: boolean) => {
    if (checked) {
      connection.connect();
    } else {
      connection.disconnect();
    }
  };
  return (
    <Switch
      checked={connection.isConnected}
      label={"Connection"}
      onChange={onChange}
    />
  );
});
