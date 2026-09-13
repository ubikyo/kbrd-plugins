import { Select } from "@mantine/core";

import PropertyGroup from "../../shared/web/ux/PropertyGroup";
import type { KeyMode, LayoutKeyConfig } from "./index";

/** The two ways a key can behave, in the dropdown's own order — the
 * default leads the list, so it reads as the default. */
const MODES: { value: KeyMode; label: string }[] = [
  { value: "momentary", label: "Momentary" },
  { value: "toggle", label: "Toggle" },
];

/** What a key is unless it says otherwise: active only while it's held.
 * Also `layout-key`'s own manifest default — see `plugin.json`, which the
 * host merges in before this ever sees a config. The fallback below is
 * for the instance that predates the field. */
export const DEFAULT_KEY_MODE: KeyMode = "momentary";

/**
 * Whether a key is momentary (active only while held) or a toggle.
 *
 * A block of its own rather than a shared one: `keyMode` belongs to
 * `layout-key` alone — a Space has no such thing — so it lives here
 * beside the plugin that owns it rather than in `shared/web/blocks`,
 * where a block has to be usable by any plugin carrying its fields.
 *
 * Permanent, with no `+`/`×`: a key is always one mode or the other, so
 * there is no "not set" for a `×` to hand back to and nothing an `+`
 * would be adding (see `PropertyGroup`'s own `Props`). That is also why
 * `keyMode` can sit in the manifest's `defaultConfig`, which an
 * addable block's field can't — see `Background` for the other side of
 * that rule.
 */
export default function Type({
  config,
  onChange,
  disabled = false,
}: {
  config: LayoutKeyConfig;
  onChange: (value: LayoutKeyConfig) => void;
  disabled?: boolean;
}) {
  return (
    <PropertyGroup title="Type">
      <Select
        // Bare like every other field in these panels — the group's own
        // header already names it, so it carries no marker of its own
        // beyond `aria-label`. See `UnitSelect` for the same bargain and
        // for the two style corrections below.
        variant="unstyled"
        size="xs"
        w="100%"
        aria-label="Type"
        // A key is always one of the two: clicking the selected option
        // must not clear the field back to nothing.
        allowDeselect={false}
        data={MODES}
        value={config.keyMode ?? DEFAULT_KEY_MODE}
        disabled={disabled}
        onChange={(value) =>
          onChange({
            ...config,
            // Anything that isn't the other mode is the default one, so
            // a null from a cleared field can't leave the key modeless.
            keyMode: value === "toggle" ? "toggle" : DEFAULT_KEY_MODE,
          })
        }
        styles={{
          input: { paddingInlineEnd: 14 },
          section: { width: "auto" },
        }}
      />
    </PropertyGroup>
  );
}
