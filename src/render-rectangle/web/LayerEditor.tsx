import BackgroundBlock from "../../shared/web/blocks/Background";
import BorderBlock from "../../shared/web/blocks/Border";
import DimensionBlock from "../../shared/web/blocks/Dimension";
import PositionBlock from "../../shared/web/blocks/Position";

import type { RectangleConfig } from "./index";

type Props = {
  // Already merged over the plugin's `defaultConfig` by the host, so every
  // field below has a value to show even when the instance stores none.
  config: RectangleConfig;
  // What the instance actually stores — the difference between "set to the
  // default value" and "not set", which is what a property group's own
  // open/closed state means. See `PluginEditorProps` in kbrd-web.
  definedConfig?: Partial<RectangleConfig>;
  onChange: (value: Partial<RectangleConfig>) => void;
  disabled?: boolean;
};

/**
 * A rectangle is a filled, outlined box of some size somewhere in a cell,
 * so its editor is the four shared blocks that say exactly those things
 * (see `shared/web/blocks`): Position where it goes, Dimension how big it
 * is, Background what fills it, Border what outlines it.
 *
 * Each one is optional in its own right: a rectangle with no Dimension
 * group is the renderer's own default size, one with no Background falls
 * back to the `color` the plugin stored before that block existed.
 */
export default function LayerEditor({
  config,
  definedConfig,
  onChange,
  disabled = false,
}: Props) {
  // Every write builds on what's stored, not on the merged view — editing
  // one field must not silently set every other one to its default.
  const stored: Partial<RectangleConfig> = definedConfig ?? config;

  return (
    <>
      <PositionBlock
        config={config}
        stored={stored}
        onChange={onChange}
        disabled={disabled}
      />
      <DimensionBlock
        config={config}
        stored={stored}
        onChange={onChange}
        disabled={disabled}
      />
      <BackgroundBlock
        config={config}
        stored={stored}
        onChange={onChange}
        disabled={disabled}
      />
      <BorderBlock
        config={config}
        stored={stored}
        onChange={onChange}
        disabled={disabled}
      />
    </>
  );
}
