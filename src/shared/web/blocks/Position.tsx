import { ActionIcon, Box, Group } from "@mantine/core";
import {
  MdVerticalAlignBottom,
  MdVerticalAlignCenter,
  MdVerticalAlignTop,
} from "react-icons/md";
import type { IconType } from "react-icons";

import AnchorGrid, {
  anchorParts,
  type AnchorHorizontal,
  type AnchorValue,
  type AnchorVertical,
} from "../ux/AnchorGrid";
import IconToggle, { ICON_SIZE } from "../ux/IconToggle";
import NumberField from "../ux/NumberField";
import PropertyGroup from "../ux/PropertyGroup";
import UnitSelect, {
  DEFAULT_UNIT,
  UNIT_MAX,
  UNIT_ORIGIN,
  type Unit,
} from "../ux/UnitSelect";
import type { BlockProps } from "./block";

/** What the Position block owns. `precisePlacement` is the flag every
 * renderer already reads to mean "use x/y instead of the Placement grid",
 * so the group's own presence is what sets it — no second coordinate pair
 * beside the one that exists. */
export type PositionConfig = {
  precisePlacement: boolean;
  positionUnit: Unit;
  // Both measured from the cell's own top-left corner, in `positionUnit`.
  x: number;
  y: number;
  // Which point of the element the pair addresses — see `AnchorGrid`.
  anchor: AnchorValue;
};

export const POSITION_KEYS = [
  "precisePlacement",
  "positionUnit",
  "x",
  "y",
  "anchor",
] as const;

/** The element's own centre — which, with x/y defaulting to 50/50, starts
 * a fresh Position group with the element centred on the cell. */
export const DEFAULT_ANCHOR: AnchorValue = "middle-center";

// The six one-click alignments: each one drops the element on a share of
// the cell *and* anchors the matching side of it there, which is the pair
// of settings "aligned left" actually means (x at the cell's leading edge
// alone would hang the element's own centre off it).
//
// Percentages, so the row only makes sense while the unit is `%` — an
// alignment is a relative position by definition, and 50/100 have no
// millimetre equivalent this editor could compute (it never sees the
// cell's size). See the row's own `disabled` below.
//
// Both halves are drawn with the same three glyphs, the horizontal ones
// turned a quarter turn anticlockwise: that maps up onto left, down onto
// right, and leaves the pair reading as one control rather than as two
// unrelated icon sets that happen to sit side by side.
const QUARTER_TURN = -90;

const ALIGNMENTS: {
  horizontal: {
    anchor: AnchorHorizontal;
    x: number;
    label: string;
    Icon: IconType;
  }[];
  vertical: {
    anchor: AnchorVertical;
    y: number;
    label: string;
    Icon: IconType;
  }[];
} = {
  horizontal: [
    { anchor: "left", x: 0, label: "Align left", Icon: MdVerticalAlignTop },
    { anchor: "center", x: 50, label: "Align center", Icon: MdVerticalAlignCenter },
    { anchor: "right", x: 100, label: "Align right", Icon: MdVerticalAlignBottom },
  ],
  vertical: [
    { anchor: "top", y: 0, label: "Align top", Icon: MdVerticalAlignTop },
    { anchor: "middle", y: 50, label: "Align middle", Icon: MdVerticalAlignCenter },
    { anchor: "bottom", y: 100, label: "Align bottom", Icon: MdVerticalAlignBottom },
  ],
};

/**
 * Where the element sits in its cell: a coordinate pair in `%` or `mm`,
 * which of its own nine points that pair addresses, and six one-click
 * alignments that set both at once.
 *
 * Adding the group is what turns precise placement on; removing it drops
 * every field, handing the element back to the Placement grid's own
 * horizontal/vertical anchors (`precisePlacement` defaults to `false` in
 * each manifest, so its absence already reads as off).
 */
export default function Position<T extends PositionConfig>({
  config,
  stored,
  onChange,
  disabled = false,
}: BlockProps<T>) {
  // One cast, here: every write below is this block's own fields spread
  // over what's stored, which is a `Partial<T>` by construction — TS just
  // can't see that a partial of the base type is one of the subtype.
  const write = (patch: Partial<PositionConfig>) =>
    onChange({ ...stored, ...patch } as Partial<T>);

  // What the two coordinate fields are counted in, and so what bounds
  // them — the unit an instance stored before this existed being the
  // percentages it was written as.
  const unit = config.positionUnit ?? DEFAULT_UNIT;
  const anchor = anchorParts(config.anchor ?? DEFAULT_ANCHOR);

  function add() {
    write({
      precisePlacement: true,
      positionUnit: unit,
      x: config.x ?? UNIT_ORIGIN[unit],
      y: config.y ?? UNIT_ORIGIN[unit],
      anchor: config.anchor ?? DEFAULT_ANCHOR,
    });
  }

  function remove() {
    const remaining: Partial<T> = { ...stored };
    for (const key of POSITION_KEYS) delete remaining[key];
    onChange(remaining);
  }

  // Switching unit re-seeds the pair on the new unit's own origin rather
  // than converting it: the conversion needs the cell's own size, which
  // only the renderers ever see — and carrying the raw numbers across
  // would read as 50 mm on a 16 mm keycap, i.e. an element thrown clean
  // off the cell (where the renderers' own clip then hides it entirely).
  function setUnit(next: Unit) {
    if (next === unit) return;
    write({ positionUnit: next, x: UNIT_ORIGIN[next], y: UNIT_ORIGIN[next] });
  }

  return (
    <PropertyGroup
      title="Position"
      active={config.precisePlacement}
      onAdd={add}
      onRemove={remove}
    >
      {/* Both coordinates are measured from the cell's own top-left
          corner — read either as a share of the cell (`0`/`0` that
          corner, `100`/`100` the opposite one) or as a plain offset in
          the display's own unit, depending on the select leading the
          row. */}
      {/* Bottom-aligned rather than centred, so the anchor grid's own
          last row sits on the underline the fields draw. */}
      <Group gap="xs" wrap="nowrap" align="flex-end">
        <UnitSelect
          aria-label="Position unit"
          value={unit}
          disabled={disabled}
          onChange={setUnit}
        />
        {/* Arrows rather than "X"/"Y": with the unit sitting right in
            front of them, the axis is the only thing left for these
            markers to say, and each one says it in a single glyph's worth
            of a row that has none to spare. */}
        <NumberField
          aria-label="X"
          lead="↔"
          width={44}
          min={0}
          max={UNIT_MAX[unit]}
          value={config.x ?? UNIT_ORIGIN[unit]}
          disabled={disabled}
          onChange={(next) => write({ x: next })}
        />
        <NumberField
          aria-label="Y"
          lead="↕"
          width={44}
          min={0}
          max={UNIT_MAX[unit]}
          value={config.y ?? UNIT_ORIGIN[unit]}
          disabled={disabled}
          onChange={(next) => write({ y: next })}
        />
        {/* Which point of the element those coordinates address. Kept
            inline after the two fields it qualifies rather than given a
            row of its own — it's 25px wide all told. */}
        <AnchorGrid
          aria-label="Coordinate anchor"
          value={config.anchor ?? DEFAULT_ANCHOR}
          disabled={disabled}
          onChange={(next) => write({ anchor: next })}
        />
      </Group>
      {/* The six alignments, on their own row under the pair they write
          to — each one a shortcut for a coordinate *and* the anchor that
          goes with it (see `ALIGNMENTS`), and each lit while the config
          already says exactly what it would set. Off in millimetres,
          where an alignment has no value this editor could compute; the
          unit select is right there to switch. */}
      <Group gap="xs" wrap="nowrap" mt="xs" pt={2}>
        <ActionIcon.Group>
          {ALIGNMENTS.horizontal.map((item) => (
            <IconToggle
              key={item.anchor}
              label={item.label}
              Icon={item.Icon}
              rotate={QUARTER_TURN}
              active={anchor.horizontal === item.anchor && config.x === item.x}
              disabled={disabled || unit === "mm"}
              onClick={() =>
                write({ x: item.x, anchor: `${anchor.vertical}-${item.anchor}` })
              }
            />
          ))}
          {/* What splits one axis from the other: a section of its own
              rather than a seventh button — transparent and borderless,
              holding nothing but the rule itself. */}
          <ActionIcon.GroupSection
            aria-hidden
            size="md"
            w={11}
            px={0}
            style={
              {
                "--section-bg": "transparent",
                "--section-bd": "none",
              } as React.CSSProperties
            }
          >
            <Box
              w={1}
              h={ICON_SIZE}
              style={{ background: "var(--kbrd-border-color)" }}
            />
          </ActionIcon.GroupSection>
          {ALIGNMENTS.vertical.map((item) => (
            <IconToggle
              key={item.anchor}
              label={item.label}
              Icon={item.Icon}
              active={anchor.vertical === item.anchor && config.y === item.y}
              disabled={disabled || unit === "mm"}
              onClick={() =>
                write({
                  y: item.y,
                  anchor: `${item.anchor}-${anchor.horizontal}`,
                })
              }
            />
          ))}
        </ActionIcon.Group>
      </Group>
    </PropertyGroup>
  );
}
