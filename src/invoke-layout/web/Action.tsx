import {
  Box,
  Center,
  Group,
  SegmentedControl,
  Select,
  Stack,
  VisuallyHidden,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  TbSquareArrowDown,
  TbSquareArrowDownFilled,
  TbSquareArrowUp,
  TbSquareArrowUpFilled,
} from "react-icons/tb";

import type { BlockProps } from "../../shared/web/blocks/block";
import { ICON_SIZE } from "../../shared/web/ux/IconToggle";
import { useLeadSection } from "../../shared/web/ux/lead";
import PropertyGroup from "../../shared/web/ux/PropertyGroup";
import type { LayoutConfig } from "./index";

type Option = { value: string; label: string };
type Layout = { id: number; name: string };
type Layer = { id: number; layout_id: number; name: string };

/** The fields this block owns — everything the group's `×` takes away
 * again, exactly as a shared block states its own (see
 * `blocks/Position`'s `POSITION_KEYS`). */
export const ACTION_KEYS = ["layoutId", "layerId", "event"] as const;

/** Which half of the key's own press a fresh action fires on. Matches the
 * manifest's `defaultConfig`, so adding the group and never touching the
 * control stores the same thing the plugin would have fallen back to. */
export const DEFAULT_EVENT: LayoutConfig["event"] = "down";

// What an `xs` field is tall, so the control beside the select sits on the
// same top and bottom rather than floating in the middle of the row.
const FIELD_HEIGHT = 30;

// The corner `ux/IconToggle` rounds its own two-state buttons by — this is
// the same gesture, just an exclusive one.
const RADIUS = 4;

// Taken off the room `useLeadSection` leaves after each marker here: the
// two markers name a *choice* rather than a value being typed, and the
// select's own text starts further in than an input's does, so the
// standard gap reads as a hole between the colon and the name it
// introduces. Only these two fields, which is why it's subtracted at the
// call site rather than changed in `lead`.
const LEAD_TRIM = 8;

// The gap between the two buttons. It only *is* the gap because each
// button is exactly its glyph and nothing more (see the `label` style
// below): give the button any box of its own and that box's own margin
// gets added to this on both sides, and the last glyph stops sitting on
// the panel's right edge.
const BUTTON_GAP = 2;

/**
 * The two moments a key can fire on, drawn as the keycap itself: a square
 * with the arrow going into it (pressed) or coming out of it (released).
 *
 * Each moment carries both weights of its glyph, because the choice is
 * marked by the icon and nothing else — the chosen one is drawn filled,
 * the other outlined — so the control needs no plate or rule of its own
 * behind them.
 */
const EVENTS: {
  value: LayoutConfig["event"];
  label: string;
  Icon: IconType;
  IconActive: IconType;
}[] = [
  {
    value: "down",
    label: "On key press",
    Icon: TbSquareArrowDown,
    IconActive: TbSquareArrowDownFilled,
  },
  {
    value: "up",
    label: "On key release",
    Icon: TbSquareArrowUp,
    IconActive: TbSquareArrowUpFilled,
  },
];

// Exactly as wide as the event control ends up being: one glyph per
// moment, and the gap between them — nothing else, since the buttons are
// their glyphs and the control keeps no padding of its own. The second
// row reserves this same width so the layer select below lines up with
// the layout select above, both edges alike.
const EVENT_WIDTH =
  EVENTS.length * ICON_SIZE + (EVENTS.length - 1) * BUTTON_GAP;

async function fetchOptions<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(payload.error || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

/**
 * What this plugin does when the key it's attached to is used: which
 * layout to switch to, which of that layout's layers to land on, and
 * which half of the key's own press to do it on.
 *
 * The same shape as `invoke-layer`'s own `Action` — a select and the two
 * event glyphs on one row — with the layer select underneath it, as wide
 * as the layout select above rather than as wide as the whole row: the
 * layer is a *part* of the answer the first row gives, and the reserved
 * strip on its right says so.
 *
 * An *optional* group, like every block in `shared/web/blocks`: a key
 * carries as many actions as it's given — several of the same kind
 * included, each one its own instance, run top to bottom in the order the
 * Properties list shows them — so no single instance is the key's one
 * behaviour, and an instance with its group closed is simply a step that
 * says nothing for the state being edited (its fields come back from the
 * manifest's `defaultConfig`, i.e. no layout, no layer, on press).
 * Detaching the instance in the Properties list is still what removes the
 * step itself.
 */
export default function Action({
  config,
  stored,
  onChange,
  disabled = false,
}: BlockProps<LayoutConfig>) {
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetchOptions<Layout[]>("/api/layout"),
      fetchOptions<Layer[]>("/api/layer"),
    ])
      .then(([layoutItems, layerItems]) => {
        if (cancelled) return;
        setLayouts(layoutItems);
        setLayers(layerItems);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setLayouts([]);
          setLayers([]);
          setError(
            cause instanceof Error ? cause.message : "Unable to load options",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const layoutOptions: Option[] = useMemo(
    () =>
      layouts.map((item) => ({ value: String(item.id), label: item.name })),
    [layouts],
  );

  // Only the chosen layout's own layers: a layer belongs to one layout, so
  // any other one would be an answer this action could never carry out.
  const layerOptions: Option[] = useMemo(
    () =>
      layers
        .filter((item) => item.layout_id === config.layoutId)
        .map((item) => ({ value: String(item.id), label: item.name })),
    [config.layoutId, layers],
  );

  // The layer a layout is entered on when nothing else is said: the first
  // one it lists. `null` for a layout with no layers of its own — and
  // while the fetch is still on its way, which is what the effect below
  // catches up on.
  const firstLayerOf = (layoutId: number | null) =>
    layers.find((item) => item.layout_id === layoutId)?.id ?? null;

  const layoutLead = useLeadSection("Layout");
  const layerLead = useLeadSection("Layer");

  // Every write builds on what's stored, never on the merged view — see
  // `BlockProps`: editing the event alone must not also freeze today's
  // default layout into the state's own config.
  const write = (patch: Partial<LayoutConfig>) =>
    onChange({ ...stored, ...patch });

  function remove() {
    const remaining: Partial<LayoutConfig> = { ...stored };
    for (const key of ACTION_KEYS) delete remaining[key];
    onChange(remaining);
  }

  // `layoutId` is the field the action is actually *about*, so its presence
  // is the group's — `layerId` or `event` alone would leave a group that
  // says nothing. `null` counts as stored (that's "no layout picked yet",
  // which the select shows as an error); only `undefined` is "not set at
  // all".
  const active = stored.layoutId !== undefined;

  // Read once: it picks the control's value *and* which weight each glyph
  // is drawn in, and those two must never disagree.
  const event = config.event ?? DEFAULT_EVENT;

  // What a fresh action switches to: the first layout the list offers, so
  // the step does something the moment it's added. `null` only while the
  // list is still on its way (or has nothing in it) — the effect below
  // finishes the job when it lands.
  const firstLayoutId = layoutOptions.length
    ? Number(layoutOptions[0].value)
    : null;

  // The lists arrive after the panel does, so an action added before the
  // fetch came back has neither a first layout nor a first layer to take
  // yet. Fill them in as soon as there are some rather than leaving the
  // group sitting on its error — only while the group is open and still
  // says nothing, which is a state nothing else can put it back into
  // (neither select can be deselected).
  //
  // One effect for both, in that order: a layer is only ever chosen out of
  // a layout's own, so the layout has to land first — and two effects
  // could otherwise write over each other's patch, both building on the
  // same stored config.
  useEffect(() => {
    if (!active) return;
    if (config.layoutId == null) {
      if (firstLayoutId == null) return;
      write({
        layoutId: firstLayoutId,
        layerId: firstLayerOf(firstLayoutId),
      });
      return;
    }
    if (config.layerId != null) return;
    const layerId = firstLayerOf(config.layoutId);
    if (layerId != null) write({ layerId });
    // `write` and `firstLayerOf` both close over what this reads at the
    // moment it fires; the four values below are the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, config.layoutId, config.layerId, firstLayoutId, layers]);

  return (
    <PropertyGroup
      title="Action"
      active={active}
      onAdd={() => {
        const layoutId = config.layoutId ?? firstLayoutId;
        write({
          layoutId,
          layerId: config.layerId ?? firstLayerOf(layoutId),
          event: config.event ?? DEFAULT_EVENT,
        });
      }}
      onRemove={remove}
    >
      <Stack gap="xs">
        {/* Top-aligned rather than centred: the select grows downwards when
            it has an error to show, and the two controls have to stay on the
            same top edge while it does. */}
        <Group gap="xs" wrap="nowrap" align="flex-start">
          <Select
            variant="unstyled"
            size="xs"
            style={{ flex: 1, minWidth: 0 }}
            aria-label="Layout"
            placeholder="Select a layout"
            searchable
            leftSection={layoutLead.section}
            // Decorative: the field's accessible name is its `aria-label`,
            // and a click on the marker is meant for the field — see
            // `useLeadSection`.
            leftSectionPointerEvents="none"
            allowDeselect={false}
            data={layoutOptions}
            value={config.layoutId == null ? null : String(config.layoutId)}
            disabled={disabled}
            error={
              error || (config.layoutId == null ? "Select a layout" : undefined)
            }
            // A layer belongs to one layout, so the layer picked under the
            // old one can't survive the change: the new layout is entered
            // on its own first layer rather than on some other layout's
            // id — the same answer as adding the group.
            onChange={(value) => {
              const layoutId = value ? Number(value) : null;
              write({ layoutId, layerId: firstLayerOf(layoutId) });
            }}
            // The same two corrections every `unstyled` select in these
            // panels needs (see `ux/UnitSelect`): no padding of its own to
            // keep the chevron off the text, and a section that would
            // otherwise be as wide as the field is tall — plus the room
            // the marker takes at the start.
            styles={{
              input: {
                paddingInlineStart: layoutLead.room - LEAD_TRIM,
                paddingInlineEnd: 14,
              },
              section: { width: "auto" },
            }}
          />
          {/* Down/up are one choice with two answers, so one control rather
              than a pair of independent toggles. The two glyphs carry the
              state themselves — the chosen moment is drawn filled, the
              other outlined — so the control keeps nothing of its own
              behind them: no plate, no indicator, no separator, and no
              padding either, which is what leaves the second button flush
              with the panel's right edge. The select takes the rest of the
              row. */}
          <SegmentedControl
            size="xs"
            radius={RADIUS}
            h={FIELD_HEIGHT}
            withItemsBorders={false}
            value={event}
            disabled={disabled}
            onChange={(value) =>
              write({ event: value === "up" ? "up" : "down" })
            }
            data={EVENTS.map(({ value, label, Icon, IconActive }) => {
              const Glyph = value === event ? IconActive : Icon;
              return {
                value,
                label: (
                  // The glyph is the whole button, so the name it's picked
                  // by is a hidden one — and the same string as a native
                  // tooltip, for anyone reading with a pointer instead.
                  <Center title={label}>
                    <Glyph size={ICON_SIZE} />
                    <VisuallyHidden>{label}</VisuallyHidden>
                  </Center>
                ),
              };
            })}
            // The plate the active button would be given, in both the forms
            // Mantine draws it in: the sliding `indicator`, and the label's
            // own `::before` it falls back to before the first move.
            style={{ "--sc-color": "transparent", "--sc-shadow": "none" }}
            styles={{
              root: {
                backgroundColor: "transparent",
                padding: 0,
                gap: BUTTON_GAP,
              },
              indicator: { display: "none" },
              // The button is the glyph: exactly as wide as the icon it
              // draws, with none of the text padding an `xs` control comes
              // with. Full height all the same, so the whole depth of the
              // row is clickable and the glyph sits in the middle of it.
              label: {
                padding: 0,
                width: ICON_SIZE,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              },
            }}
          />
        </Group>
        {/* The same row again, with the event control's width held empty:
            that's what makes this select exactly as wide as the layout one
            above it, rather than running on past its right edge. */}
        <Group gap="xs" wrap="nowrap" align="flex-start">
          <Select
            variant="unstyled"
            size="xs"
            style={{ flex: 1, minWidth: 0 }}
            aria-label="Layer"
            placeholder="Select a layer"
            searchable
            leftSection={layerLead.section}
            // Decorative: the field's accessible name is its `aria-label`,
            // and a click on the marker is meant for the field — see
            // `useLeadSection`.
            leftSectionPointerEvents="none"
            // The layout's first layer is taken as soon as a layout is,
            // so "no layer" is never an answer the panel offers — only a
            // state it passes through, and one the error below names.
            allowDeselect={false}
            data={layerOptions}
            value={config.layerId == null ? null : String(config.layerId)}
            // Nothing to pick from until a layout says which layers exist.
            disabled={disabled || config.layoutId == null}
            // Only worth saying while the layout actually has layers: a
            // layout with none leaves nothing for the reader to do about
            // it.
            error={
              error ||
              (layerOptions.length > 0 && config.layerId == null
                ? "Select a layer"
                : undefined)
            }
            onChange={(value) =>
              write({ layerId: value ? Number(value) : null })
            }
            styles={{
              input: {
                paddingInlineStart: layerLead.room - LEAD_TRIM,
                paddingInlineEnd: 14,
              },
              section: { width: "auto" },
            }}
          />
          <Box w={EVENT_WIDTH} style={{ flexShrink: 0 }} aria-hidden />
        </Group>
      </Stack>
    </PropertyGroup>
  );
}
