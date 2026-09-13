import PositionBlock from "../../shared/web/blocks/Position";
import TypographyBlock from "../../shared/web/blocks/Typography";

import type { LabelConfig } from "./index";

type Props = {
  // Already merged over the plugin's `defaultConfig` by the host, so every
  // field below has a value to show even when the instance stores none.
  config: LabelConfig;
  // What the instance actually stores — the difference between "set to the
  // default value" and "not set", which is what a property group's own
  // open/closed state means. See `PluginEditorProps` in kbrd-web.
  definedConfig?: Partial<LabelConfig>;
  onChange: (value: Partial<LabelConfig>) => void;
  disabled?: boolean;
};

/**
 * A label is a piece of text placed in a cell, so its editor is exactly
 * the two shared blocks that say those two things — see
 * `shared/web/blocks`. Everything that used to live here (the coordinate
 * pair and its unit, the anchor, the alignments, the font row, the
 * emphases) moved into them unchanged, so `render-rectangle` and anything
 * else needing "where does it go" gets the same control rather than a
 * second copy of it.
 */
export default function MappingEditor({
  config,
  definedConfig,
  onChange,
  disabled = false,
}: Props) {
  // Every write builds on what's stored, not on the merged view — editing
  // one field must not silently set every other one to its default.
  const stored: Partial<LabelConfig> = definedConfig ?? config;

  return (
    <>
      <PositionBlock
        config={config}
        stored={stored}
        onChange={onChange}
        disabled={disabled}
      />
      <TypographyBlock
        config={config}
        stored={stored}
        onChange={onChange}
        disabled={disabled}
      />
    </>
  );
}
