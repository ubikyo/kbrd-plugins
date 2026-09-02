import type { RectangleConfig } from "./index";
import Placement from "../../shared/web/Placement";

type Props = {
  config: RectangleConfig;
  onChange: (value: RectangleConfig) => void;
  disabled?: boolean;
};

export default function LayoutEditor({
  config,
  onChange,
  disabled = false,
}: Props) {
  return <Placement config={config} onChange={onChange} disabled={disabled} />;
}
