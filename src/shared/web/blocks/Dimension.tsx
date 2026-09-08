import { Group } from "@mantine/core";
import { MdHeight, MdLink, MdLinkOff } from "react-icons/md";

import IconToggle, { ICON_SIZE } from "../ux/IconToggle";
import NumberField from "../ux/NumberField";
import PropertyGroup from "../ux/PropertyGroup";
import UnitSelect, {
  DEFAULT_UNIT,
  UNIT_MAX,
  type Unit,
} from "../ux/UnitSelect";
import type { BlockProps } from "./block";

/** What the Dimension block owns. Like Position, the group's own presence
 * is the switch: an element storing none of these is sized however its
 * renderer sizes it by default. */
export type DimensionConfig = {
  dimensionUnit: Unit;
  // Both in `dimensionUnit` — a share of the cell, or an absolute size in
  // the display's own unit.
  width: number;
  height: number;
  // Whether editing one side drags the other along, keeping the shape the
  // two had when it was switched on.
  lockRatio: boolean;
};

export const DIMENSION_KEYS = [
  "dimensionUnit",
  "width",
  "height",
  "lockRatio",
] as const;

// What a fresh group seeds each side with: half a keycap either way — 50%
// of the cell, or 8 mm of a 16 mm one. `UNIT_ORIGIN`'s own `0` is the
// right seed for a *coordinate* and the wrong one for a size, which at 0
// isn't there at all.
const DEFAULT_SIZE: Record<Unit, number> = { "%": 50, mm: 8 };

// A size can go to nothing by typing, but not by seeding: the field's own
// floor is 0 so a half-typed "0" isn't fought by the input.
const MIN_SIZE = 0;

// One glyph for both sides — a double-headed arrow between two rules,
// turned a quarter turn anticlockwise for the horizontal one. Same
// bargain as the Position block's own alignment icons.
const QUARTER_TURN = -90;

/**
 * How big the element is: a width/height pair in `%` or `mm`, with a
 * ratio lock between them.
 *
 * The lock is deliberately a plain flag rather than a stored ratio: the
 * shape it preserves is whatever the two fields currently say, so
 * switching it on never changes what's on screen, and every edit
 * afterwards keeps the proportion the element had at that moment.
 */
export default function Dimension<T extends DimensionConfig>({
  config,
  stored,
  onChange,
  disabled = false,
}: BlockProps<T>) {
  // One cast, here — see `Position` for why.
  const write = (patch: Partial<DimensionConfig>) =>
    onChange({ ...stored, ...patch } as Partial<T>);

  const unit = config.dimensionUnit ?? DEFAULT_UNIT;
  const width = config.width ?? DEFAULT_SIZE[unit];
  const height = config.height ?? DEFAULT_SIZE[unit];
  const locked = config.lockRatio ?? false;

  function add() {
    write({
      dimensionUnit: unit,
      width: config.width ?? DEFAULT_SIZE[unit],
      height: config.height ?? DEFAULT_SIZE[unit],
      lockRatio: locked,
    });
  }

  function remove() {
    const remaining: Partial<T> = { ...stored };
    for (const key of DIMENSION_KEYS) delete remaining[key];
    onChange(remaining);
  }

  // Re-seeded rather than converted on a unit change, for the same reason
  // a coordinate is (see `Position`'s own `setUnit`): 50 mm of a 16 mm
  // keycap is not what "50%" of it meant.
  function setUnit(next: Unit) {
    if (next === unit) return;
    write({
      dimensionUnit: next,
      width: DEFAULT_SIZE[next],
      height: DEFAULT_SIZE[next],
    });
  }

  // The other side follows by the ratio the two had *before* this edit,
  // clamped to the unit's own ceiling. A side that was 0 has no ratio to
  // keep, so it's left where it is rather than turned into a division by
  // zero.
  function resize(side: "width" | "height", next: number) {
    const other = side === "width" ? height : width;
    const previous = side === "width" ? width : height;
    if (!locked || previous <= 0) {
      write({ [side]: next } as Partial<DimensionConfig>);
      return;
    }
    const scaled = Math.min(
      UNIT_MAX[unit],
      Math.max(MIN_SIZE, Math.round((next * other) / previous)),
    );
    write(
      side === "width"
        ? { width: next, height: scaled }
        : { height: next, width: scaled },
    );
  }

  return (
    <PropertyGroup
      title="Dimension"
      active={DIMENSION_KEYS.some((key) => stored[key] !== undefined)}
      onAdd={add}
      onRemove={remove}
    >
      <Group gap="xs" wrap="nowrap" align="flex-end">
        <UnitSelect
          aria-label="Dimension unit"
          value={unit}
          disabled={disabled}
          onChange={setUnit}
        />
        <NumberField
          aria-label="Width"
          lead={
            <MdHeight
              size={ICON_SIZE}
              style={{ transform: `rotate(${QUARTER_TURN}deg)` }}
            />
          }
          width={48}
          min={MIN_SIZE}
          max={UNIT_MAX[unit]}
          value={width}
          disabled={disabled}
          onChange={(next) => resize("width", next)}
        />
        {/* Between the two sides it ties together, where a chain link
            belongs — and drawn broken while it's off. */}
        <IconToggle
          label="Lock ratio"
          Icon={locked ? MdLink : MdLinkOff}
          active={locked}
          disabled={disabled}
          onClick={() => write({ lockRatio: !locked })}
        />
        <NumberField
          aria-label="Height"
          lead={<MdHeight size={ICON_SIZE} />}
          width={48}
          min={MIN_SIZE}
          max={UNIT_MAX[unit]}
          value={height}
          disabled={disabled}
          onChange={(next) => resize("height", next)}
        />
      </Group>
    </PropertyGroup>
  );
}
