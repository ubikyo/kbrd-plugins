import type { LayoutKeyConfig } from "./index";
import Type from "./Type";

type Props = {
  config: LayoutKeyConfig;
  onChange: (value: LayoutKeyConfig) => void;
  disabled?: boolean;
};

/**
 * A key's Layout form, which is the one block this plugin owns — see
 * `Type`. Kept as its own component rather than exporting the block
 * directly, so the plugin keeps the `LayoutEditor` name every other
 * plugin exports and has somewhere to put a second block later.
 *
 * Moved here from `<Inspector>`'s hardcoded system properties:
 * momentary/toggle is a Key-element property like any other now, edited
 * through this plugin.
 */
export default function LayoutEditor({
  config,
  onChange,
  disabled = false,
}: Props) {
  return <Type config={config} onChange={onChange} disabled={disabled} />;
}
