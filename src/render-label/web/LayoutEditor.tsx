import type { LabelConfig } from "./index";
import Placement from "../../shared/web/Placement";

type Props = {
  config: LabelConfig;
  onChange: (value: LabelConfig) => void;
  disabled?: boolean;
};

export default function LayoutEditor({
  config,
  onChange,
  disabled = false,
}: Props) {
  return <Placement config={config} onChange={onChange} disabled={disabled} />;
}
