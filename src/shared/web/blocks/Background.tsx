import Color from "../ux/Color";
import PropertyGroup from "../ux/PropertyGroup";
import type { BlockProps } from "./block";

/** What the Background block owns. Optional in the real sense: absent
 * means the property genuinely isn't set, not "set to transparent" — which
 * is why it can't live in a manifest's `defaultConfig`, where a value
 * would make the group always present, and so always open. */
export type BackgroundConfig = {
  backgroundColor?: string;
};

export const BACKGROUND_KEYS = ["backgroundColor"] as const;

/** What the group seeds itself with the moment it's added: white at 50%
 * opacity (`80` being half of `ff`), visible enough that adding the
 * property clearly did something, faint enough not to hide whatever else
 * the element draws. */
export const DEFAULT_BACKGROUND_COLOR = "#ffffff80";

/** The element's own fill — one colour, with the opacity that makes a
 * background worth having. */
export default function Background<T extends BackgroundConfig>({
  config,
  stored,
  onChange,
  disabled = false,
}: BlockProps<T>) {
  // One cast, here — see `Position` for why.
  const write = (patch: Partial<BackgroundConfig>) =>
    onChange({ ...stored, ...patch } as Partial<T>);

  function remove() {
    const remaining: Partial<T> = { ...stored };
    for (const key of BACKGROUND_KEYS) delete remaining[key];
    onChange(remaining);
  }

  return (
    <PropertyGroup
      title="Background"
      active={stored.backgroundColor !== undefined}
      onAdd={() =>
        write({
          backgroundColor: config.backgroundColor ?? DEFAULT_BACKGROUND_COLOR,
        })
      }
      onRemove={remove}
    >
      <Color
        aria-label="Background color"
        // A background is the one colour here transparency is any use to,
        // so it's the one that gets the Opacity field — and with it the
        // alpha byte in what's stored.
        withOpacity
        value={config.backgroundColor ?? DEFAULT_BACKGROUND_COLOR}
        disabled={disabled}
        onChange={(value) => write({ backgroundColor: value })}
      />
    </PropertyGroup>
  );
}
