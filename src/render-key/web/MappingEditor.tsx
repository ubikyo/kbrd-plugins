import type { RenderKeyConfig } from "./index";
import Border from "../../shared/web/ux/Border";
import Color from "../../shared/web/ux/Color";
import PropertyGroup from "../../shared/web/ux/PropertyGroup";

// "No color" for a background that exists but hasn't been chosen — a
// fully transparent hexa, which is also what "Background" seeds itself
// with the moment it's added and what its own `×` puts back. It has to be
// a real value rather than `undefined`: absent is what makes the whole
// property group read as not-there (see `PropertyGroup`'s `active`).
const NO_BACKGROUND_COLOR = "#00000000";

type Props = {
  config: RenderKeyConfig;
  onChange: (value: RenderKeyConfig) => void;
  disabled?: boolean;
};

/**
 * The Key/Space/Layer element's own look for the active state —
 * "Background" and "Border", both genuinely optional: `PropertyGroup`'s
 * own `+`/`×` *is* what adds or removes each one from the state's config,
 * there's no separate "enabled" switch backing either.
 *
 * This plugin is `deletable: false` in its manifest (see `plugin.json`):
 * it isn't something a user attaches to an element, it's the element's
 * own form, so it never appears in the Plugins tab's draggable list and
 * its row in Properties has no delete button.
 */
export default function MappingEditor({ config, onChange }: Props) {
  function set<K extends keyof RenderKeyConfig>(
    key: K,
    value: RenderKeyConfig[K],
  ) {
    onChange({ ...config, [key]: value });
  }

  return (
    <>
      <PropertyGroup
        title="Background"
        active={config.backgroundColor !== undefined}
        onAdd={() => set("backgroundColor", NO_BACKGROUND_COLOR)}
        onRemove={() => set("backgroundColor", undefined)}
      >
        <Color
          aria-label="Background color"
          value={config.backgroundColor ?? NO_BACKGROUND_COLOR}
          onChange={(value) => set("backgroundColor", value)}
          // Back to no color, without taking the property itself away —
          // that's what the group's own `×` is for.
          onClear={() => set("backgroundColor", NO_BACKGROUND_COLOR)}
        />
      </PropertyGroup>
      <PropertyGroup
        title="Border"
        active={config.borderEnabled}
        onAdd={() => set("borderEnabled", true)}
        onRemove={() => set("borderEnabled", false)}
      >
        <Border
          value={{
            color: config.borderColor,
            style: config.borderStyle,
            width: config.borderWidth,
          }}
          onChange={(value) =>
            onChange({
              ...config,
              borderColor: value.color,
              borderStyle: value.style,
              borderWidth: value.width,
            })
          }
        />
      </PropertyGroup>
    </>
  );
}
