import BorderControl, { type BorderStyleValue } from "../ux/Border";
import PropertyGroup from "../ux/PropertyGroup";
import type { BlockProps } from "./block";

/** What the Border block owns. `borderEnabled` is the group's own switch,
 * the way `precisePlacement` is Position's: each manifest defaults it to
 * `false`, so its absence already reads as "no border". */
export type BorderConfig = {
  borderEnabled: boolean;
  borderColor: string;
  borderStyle: BorderStyleValue;
  borderWidth: number;
};

export const BORDER_KEYS = [
  "borderEnabled",
  "borderColor",
  "borderStyle",
  "borderWidth",
] as const;

/** The element's own outline — colour, style and width on one line.
 *
 * Closing the group drops all four fields so the manifest's own defaults
 * take over again, which is what makes re-opening it start from
 * `#ffffff`/`solid`/`1` rather than from whatever was last set. */
export default function Border<T extends BorderConfig>({
  config,
  stored,
  onChange,
  disabled = false,
}: BlockProps<T>) {
  // One cast, here — see `Position` for why.
  const write = (patch: Partial<BorderConfig>) =>
    onChange({ ...stored, ...patch } as Partial<T>);

  function remove() {
    const remaining: Partial<T> = { ...stored };
    for (const key of BORDER_KEYS) delete remaining[key];
    onChange(remaining);
  }

  return (
    <PropertyGroup
      title="Border"
      // The merged view, not `stored` — though with every manifest
      // defaulting `borderEnabled` to `false`, the two only differ once
      // something has actually been set here.
      active={config.borderEnabled}
      onAdd={() => write({ borderEnabled: true })}
      onRemove={remove}
    >
      <BorderControl
        value={{
          color: config.borderColor,
          style: config.borderStyle,
          width: config.borderWidth,
        }}
        disabled={disabled}
        onChange={(value) =>
          write({
            borderColor: value.color,
            borderStyle: value.style,
            borderWidth: value.width,
          })
        }
      />
    </PropertyGroup>
  );
}
