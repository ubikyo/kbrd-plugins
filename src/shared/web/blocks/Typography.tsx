import { Group, Select } from "@mantine/core";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
} from "react-icons/md";

import { fontSizeValue, type FontSize } from "../fontSize";
import Color from "../ux/Color";
import IconToggle from "../ux/IconToggle";
import NumberField from "../ux/NumberField";
import PropertyGroup from "../ux/PropertyGroup";
import TextField from "../ux/TextField";
import type { BlockProps } from "./block";

/** What the Typography block owns — the text itself and everything about
 * how it's drawn. */
export type TypographyConfig = {
  text: string;
  // Millimetres, as a plain number. Older instances may still carry one
  // of the named steps ("md"…) — `fontSizeValue` resolves either.
  size: FontSize;
  color: string;
  font?: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
};

export const TYPOGRAPHY_KEYS = [
  "text",
  "font",
  "size",
  "color",
  "bold",
  "italic",
  "underline",
] as const;

// Any combination of the three is valid, so each is its own independent
// two-state button.
const EMPHASES: {
  key: "bold" | "italic" | "underline";
  label: string;
  Icon: IconType;
}[] = [
  { key: "bold", label: "Bold", Icon: MdFormatBold },
  { key: "italic", label: "Italic", Icon: MdFormatItalic },
  { key: "underline", label: "Underline", Icon: MdFormatUnderlined },
];

type FontOption = { value: string; label: string };
// One request for the whole app: the list is the same for every editor
// instance, and mounting a second one shouldn't re-fetch it.
let fontsRequest: Promise<FontOption[]> | undefined;

function loadFonts() {
  fontsRequest ??= fetch("/api/fonts").then(async (response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as FontOption[];
  });
  return fontsRequest;
}

/**
 * The text an element draws and how it's drawn: the string, the font and
 * its size in millimetres, its colour, and the three emphases.
 *
 * `+` stores the values already on show (the plugin's defaults, unless
 * something was set); `×` drops them all again, leaving the renderer back
 * on those defaults.
 */
export default function Typography<T extends TypographyConfig>({
  config,
  stored,
  onChange,
  disabled = false,
}: BlockProps<T>) {
  const [fonts, setFonts] = useState<FontOption[]>([]);
  const [fontError, setFontError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadFonts()
      .then((values) => {
        if (!cancelled) {
          setFonts(values);
          setFontError(null);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setFonts([]);
          setFontError(
            cause instanceof Error ? cause.message : "Unable to load fonts",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // One cast, here — see `Position` for why.
  const write = (patch: Partial<TypographyConfig>) =>
    onChange({ ...stored, ...patch } as Partial<T>);

  function add() {
    const added: Partial<T> = { ...stored };
    for (const key of TYPOGRAPHY_KEYS) {
      (added as Record<string, unknown>)[key] = config[key];
    }
    onChange(added);
  }

  function remove() {
    const remaining: Partial<T> = { ...stored };
    for (const key of TYPOGRAPHY_KEYS) delete remaining[key];
    onChange(remaining);
  }

  return (
    <PropertyGroup
      title="Typography"
      // Set as soon as any one field is stored: removing the group is what
      // clears them all together.
      active={TYPOGRAPHY_KEYS.some((key) => stored[key] !== undefined)}
      onAdd={add}
      onRemove={remove}
    >
      <TextField
        aria-label="Text"
        lead="Text"
        placeholder="Label"
        value={config.text}
        disabled={disabled}
        onChange={(value) => write({ text: value })}
      />
      <Group gap="xs" wrap="nowrap" mt="xs">
        <Select
          variant="unstyled"
          size="xs"
          style={{ flex: 1, minWidth: 0 }}
          aria-label="Font"
          placeholder="Choose a font"
          searchable
          allowDeselect={false}
          data={fonts}
          value={config.font}
          disabled={disabled}
          error={fontError || undefined}
          onChange={(value) => value && write({ font: value })}
        />
        <NumberField
          aria-label="Size"
          // Millimetres of real glass, the same unit every renderer reads
          // it as — see `fontSizeValue` and the Kivy renderers' own `mm()`
          // conversion. Worth saying out loud in the field, since nothing
          // about a number between 1 and 999 hints at it.
          suffix=" mm"
          // Whatever this takes comes straight out of the font Select
          // beside it, which fills the rest of the row (`flex: 1`).
          width={63}
          min={1}
          max={999}
          // `fontSizeValue` so an instance still carrying one of the old
          // named steps shows the millimetres it actually resolved to;
          // what gets written back is always a plain number.
          value={fontSizeValue(config.size)}
          disabled={disabled}
          onChange={(next) => write({ size: next })}
        />
      </Group>
      {/* Colour and the three emphases share one row — they're all about
          how the text looks, and neither half is wide enough to earn a row
          of its own. Pushed to opposite ends, so the buttons sit against
          the panel's own right edge rather than trailing the colour
          field's variable width. */}
      <Group gap="sm" wrap="nowrap" mt="xs" justify="space-between">
        <Color
          aria-label="Text color"
          withOpacity
          value={config.color}
          disabled={disabled}
          onChange={(value) => write({ color: value })}
        />
        {/* `gap` rather than a margin on each: flex puts the 3px *between*
            buttons, so the last one already ends flush, with nothing after
            it. */}
        <Group gap={3} wrap="nowrap">
          {EMPHASES.map(({ key, label, Icon }) => (
            <IconToggle
              key={key}
              label={label}
              Icon={Icon}
              active={config[key]}
              disabled={disabled}
              onClick={() => write({ [key]: !config[key] })}
            />
          ))}
        </Group>
      </Group>
    </PropertyGroup>
  );
}
