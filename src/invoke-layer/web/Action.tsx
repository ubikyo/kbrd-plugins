import {
  Center,
  Group,
  SegmentedControl,
  Select,
  VisuallyHidden,
} from "@mantine/core";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import {
  TbSquareArrowDown,
  TbSquareArrowDownFilled,
  TbSquareArrowUp,
  TbSquareArrowUpFilled,
} from "react-icons/tb";

import type { BlockProps } from "../../shared/web/blocks/block";
import { ICON_SIZE } from "../../shared/web/ux/IconToggle";
import PropertyGroup from "../../shared/web/ux/PropertyGroup";
import type { LayerConfig } from "./index";

type Option = { value: string; label: string };
type Layout = { id: number; name: string };
type Layer = { id: number; layout_id: number; name: string };

/** The fields this block owns — everything the group's `×` takes away
 * again, exactly as a shared block states its own (see
 * `blocks/Position`'s `POSITION_KEYS`). */
export const ACTION_KEYS = ["layerId", "event"] as const;

/** Which half of the key's own press a fresh action fires on. Matches the
 * manifest's `defaultConfig`, so adding the group and never touching the
 * control stores the same thing the plugin would have fallen back to. */
export const DEFAULT_EVENT: LayerConfig["event"] = "down";

// What an `xs` field is tall, so the control beside the select sits on the
// same top and bottom rather than floating in the middle of the row.
const FIELD_HEIGHT = 30;

// The corner `ux/IconToggle` rounds its own two-state buttons by — this is
// the same gesture, just an exclusive one.
const RADIUS = 4;

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
  value: LayerConfig["event"];
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
 * What this plugin does when the key it's attached to is used: which layer
 * to switch to, and which half of the key's own press to do it on.
 *
 * An *optional* group, like every block in `shared/web/blocks`: a key
 * carries as many actions as it's given — several of the same kind
 * included, each one its own instance, run top to bottom in the order the
 * Properties list shows them — so no single instance is the key's one
 * behaviour, and an instance with its group closed is simply a step that
 * says nothing for the state being edited (its fields come back from the
 * manifest's `defaultConfig`, i.e. no layer, on press). Detaching the
 * instance in the Properties list is still what removes the step itself.
 *
 * Layer's own, not a shared block: every Invoke plugin has an action, but
 * no two are the same one (a layer to switch to, a key combination to
 * send, an application to raise), so there is nothing here for a second
 * plugin to reuse beyond the group itself.
 */
export default function Action({
  config,
  stored,
  onChange,
  disabled = false,
}: BlockProps<LayerConfig>) {
  const [options, setOptions] = useState<Option[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetchOptions<Layout[]>("/api/layout"),
      fetchOptions<Layer[]>("/api/layer"),
    ])
      .then(([layouts, layers]) => {
        if (cancelled) return;
        const names = new Map(layouts.map((item) => [item.id, item.name]));
        setOptions(
          layers.map((item) => ({
            value: String(item.id),
            label: `${names.get(item.layout_id) ?? "Layout"} / ${item.name}`,
          })),
        );
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setOptions([]);
          setError(
            cause instanceof Error ? cause.message : "Unable to load layers",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Every write builds on what's stored, never on the merged view — see
  // `BlockProps`: editing the event alone must not also freeze today's
  // default layer into the state's own config.
  const write = (patch: Partial<LayerConfig>) =>
    onChange({ ...stored, ...patch });

  function remove() {
    const remaining: Partial<LayerConfig> = { ...stored };
    for (const key of ACTION_KEYS) delete remaining[key];
    onChange(remaining);
  }

  // `layerId` is the field the action is actually *about*, so its presence
  // is the group's — `event` alone would leave a group that says nothing.
  // `null` counts as stored (that's "no layer picked yet", which the
  // select shows as an error); only `undefined` is "not set at all".
  const active = stored.layerId !== undefined;

  // Read once: it picks the control's value *and* which weight each glyph
  // is drawn in, and those two must never disagree.
  const event = config.event ?? DEFAULT_EVENT;

  // What a fresh action switches to: the first layer the list offers, so
  // the step does something the moment it's added. `null` only while the
  // list is still on its way (or has nothing in it) — the effect below
  // finishes the job when it lands.
  const firstLayerId = options.length ? Number(options[0].value) : null;

  // The list arrives after the panel does, so an action added before the
  // fetch came back has no first layer to take yet. Fill it in as soon as
  // there is one rather than leaving the group sitting on its error —
  // only while the group is open and still says no layer, which is a
  // state nothing else can put it back into (the select can't be
  // deselected).
  useEffect(() => {
    if (!active || config.layerId != null || firstLayerId == null) return;
    write({ layerId: firstLayerId });
    // `write` closes over what's stored, which is exactly what this reads
    // at the moment it fires; the three values above are the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, config.layerId, firstLayerId]);

  return (
    <PropertyGroup
      title="Action"
      active={active}
      onAdd={() =>
        write({
          layerId: config.layerId ?? firstLayerId,
          event: config.event ?? DEFAULT_EVENT,
        })
      }
      onRemove={remove}
    >
      {/* Top-aligned rather than centred: the select grows downwards when
          it has an error to show, and the two controls have to stay on the
          same top edge while it does. */}
      <Group gap="xs" wrap="nowrap" align="flex-start">
        <Select
          variant="unstyled"
          size="xs"
          style={{ flex: 1, minWidth: 0 }}
          aria-label="Layer"
          placeholder="Select a layer"
          searchable
          allowDeselect={false}
          data={options}
          value={config.layerId == null ? null : String(config.layerId)}
          disabled={disabled}
          error={
            error || (config.layerId == null ? "Select a layer" : undefined)
          }
          onChange={(value) =>
            write({ layerId: value ? Number(value) : null })
          }
          // The same two corrections every `unstyled` select in these
          // panels needs (see `ux/UnitSelect`): no padding of its own to
          // keep the chevron off the text, and a section that would
          // otherwise be as wide as the field is tall. No marker on this
          // one: the plugin is called "Set layer", so a "Layer :" in
          // front of the field would only say it twice.
          styles={{
            input: { paddingInlineEnd: 14 },
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
    </PropertyGroup>
  );
}
