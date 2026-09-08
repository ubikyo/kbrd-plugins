import {
  Center,
  Group,
  SegmentedControl,
  Select,
  VisuallyHidden,
} from "@mantine/core";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import { TbArrowBarToDown, TbArrowBarUp } from "react-icons/tb";

import { ICON_SIZE } from "../../shared/web/ux/IconToggle";
import PropertyGroup from "../../shared/web/ux/PropertyGroup";
import type { LayerConfig } from "./index";

type Option = { value: string; label: string };
type Layout = { id: number; name: string };
type Layer = { id: number; layout_id: number; name: string };

// What an `xs` field is tall, so the control beside the select sits on the
// same top and bottom rather than floating in the middle of the row.
const FIELD_HEIGHT = 30;

// The corner `ux/IconToggle` rounds its own two-state buttons by — this is
// the same gesture, just an exclusive one.
const RADIUS = 4;

/**
 * The two moments a key can fire on, drawn as the key's own travel: the
 * bar is its bottom stop, and the arrow either lands on it (pressed) or
 * leaves it (released) — one shared baseline, so the pair reads as one
 * control rather than as two unrelated glyphs.
 *
 * These are the closest thing react-icons carries: no set in it has a
 * pressed/released keycap (see this plugin's own notes in the review — the
 * app draws its icons from react-icons' Tabler set, `react-icons/tb`, so
 * an equivalent would be looked for at https://tabler.io/icons, or in
 * Material Symbols via `react-icons/md`).
 */
const EVENTS: {
  value: LayerConfig["event"];
  label: string;
  Icon: IconType;
}[] = [
  { value: "down", label: "On key press", Icon: TbArrowBarToDown },
  { value: "up", label: "On key release", Icon: TbArrowBarUp },
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

type Props = {
  config: LayerConfig;
  onChange: (value: LayerConfig) => void;
  disabled?: boolean;
};

/**
 * What this plugin does when the key it's attached to is used: which layer
 * to switch to, and which half of the key's own press to do it on.
 *
 * A permanent group (no `+`/`×`, see `PropertyGroup`): it isn't an
 * optional extra over the plugin, it *is* the plugin — an instance with no
 * action left would be an instance with nothing to do, which is what
 * detaching it in the Properties list already means.
 *
 * Layer's own, not a shared block: every Invoke plugin has an action, but
 * no two are the same one (a layer to switch to, a key combination to
 * send, an application to raise), so there is nothing here for a second
 * plugin to reuse beyond the group itself.
 */
export default function Action({ config, onChange, disabled = false }: Props) {
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

  return (
    <PropertyGroup title="Action">
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
            onChange({ ...config, layerId: value ? Number(value) : null })
          }
          // The same two corrections every `unstyled` select in these
          // panels needs (see `ux/UnitSelect`): no padding of its own to
          // keep the chevron off the text, and a section that would
          // otherwise be as wide as the field is tall.
          styles={{
            input: { paddingInlineEnd: 14 },
            section: { width: "auto" },
          }}
        />
        {/* Down/up are one choice with two answers, so one control rather
            than a pair of independent toggles. Drawn in the panel's own
            two-state language all the same: transparent plates, and a
            white rule marking the one that's on (see `ux/IconToggle`). */}
        <SegmentedControl
          size="xs"
          radius={RADIUS}
          h={FIELD_HEIGHT}
          value={config.event ?? "down"}
          disabled={disabled}
          onChange={(value) =>
            onChange({ ...config, event: value === "up" ? "up" : "down" })
          }
          data={EVENTS.map(({ value, label, Icon }) => ({
            value,
            label: (
              // The glyph is the whole button, so the name it's picked by
              // is a hidden one — and the same string as a native tooltip,
              // for anyone reading with a pointer instead.
              <Center title={label}>
                <Icon size={ICON_SIZE} />
                <VisuallyHidden>{label}</VisuallyHidden>
              </Center>
            ),
          }))}
          styles={{
            root: {
              backgroundColor: "transparent",
              border: "1px solid var(--kbrd-border-color)",
            },
            indicator: {
              backgroundColor: "transparent",
              border: "1px solid #ffffff",
              boxShadow: "none",
            },
          }}
        />
      </Group>
    </PropertyGroup>
  );
}
