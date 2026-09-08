import Action from "./Action";
import type { LayerConfig } from "./index";

type Props = {
  config: LayerConfig;
  onChange: (value: LayerConfig) => void;
  disabled?: boolean;
};

/**
 * Switching to a layer is one thing, so this editor is the one block that
 * says it — see `Action` for what it holds and why it lives here rather
 * than in `shared/web/blocks`.
 */
export default function MappingEditor({
  config,
  onChange,
  disabled = false,
}: Props) {
  return <Action config={config} onChange={onChange} disabled={disabled} />;
}
