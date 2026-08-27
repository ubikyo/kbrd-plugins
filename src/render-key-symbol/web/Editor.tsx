import {
  Box,
  ColorInput,
  Input,
  Select,
  Slider,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useEffect, useState } from "react";

import type { KeySymbolConfig } from "./index";
import Placement from "../../shared/web/Placement";
import { fontSizeMarks, fontSizeValue } from "../../shared/web/fontSize";

const swatches = [
  "#ffffff",
  "#adb5bd",
  "#ff6b6b",
  "#ffd43b",
  "#51cf66",
  "#339af0",
  "#845ef7",
  "#000000",
];
const symbols = [
  ["⌘", "Command"],
  ["⌥", "Option"],
  ["⌃", "Control"],
  ["⇧", "Shift"],
  ["⇪", "Caps Lock"],
  ["⎋", "Escape"],
  ["↵", "Return"],
  ["⌫", "Backspace"],
  ["⌦", "Delete"],
  ["⇥", "Tab"],
  ["⇤", "Back Tab"],
  ["␣", "Space"],
  ["←", "Left"],
  ["↑", "Up"],
  ["→", "Right"],
  ["↓", "Down"],
  ["↖", "Home"],
  ["↘", "End"],
  ["⇞", "Page Up"],
  ["⇟", "Page Down"],
  ["⏎", "Enter"],
  ["⌤", "Enter alternate"],
  ["⌧", "Clear"],
  ["⎀", "Insert"],
  ["⏮", "Previous"],
  ["⏪", "Rewind"],
  ["⏯", "Play/Pause"],
  ["⏩", "Fast Forward"],
  ["⏭", "Next"],
  ["⏹", "Stop"],
  ["⏺", "Record"],
  ["⏏", "Eject"],
  ["🔇", "Mute"],
  ["🔉", "Volume Down"],
  ["🔊", "Volume Up"],
  ["🎙", "Microphone"],
  ["◐", "Brightness Down"],
  ["◑", "Brightness Up"],
  ["⌨", "Keyboard"],
  ["⏻", "Power"],
  ["🔒", "Lock"],
  ["⚙", "Settings"],
] as const;

const stripPresentation = (value: string) =>
  value.replaceAll("\uFE0E", "").replaceAll("\uFE0F", "");
const asTextSymbol = (value: string) => `${stripPresentation(value)}\uFE0E`;

type Props = {
  config: KeySymbolConfig;
  onChange: (value: KeySymbolConfig) => void;
  disabled?: boolean;
};

type FontOption = { value: string; label: string };
let fontsRequest: Promise<FontOption[]> | undefined;
const fontLoads = new Map<string, Promise<FontFace>>();

function loadFonts() {
  fontsRequest ??= fetch("/api/fonts").then(async (response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as FontOption[];
  });
  return fontsRequest;
}

function loadFont(filename: string, family: string) {
  let request = fontLoads.get(filename);
  if (!request) {
    request = new FontFace(
      family,
      `url("/api/fonts/${encodeURIComponent(filename)}")`,
    ).load();
    fontLoads.set(filename, request);
  }
  return request;
}

export default function Editor({ config, onChange, disabled = false }: Props) {
  const [fonts, setFonts] = useState<FontOption[]>([]);
  const [fontsError, setFontsError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [loadedFont, setLoadedFont] = useState("");
  const filename = config.font ?? "Inter_18pt-Regular.ttf";
  const family = `KBRD-Symbol-${filename.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  useEffect(() => {
    let cancelled = false;
    void loadFonts()
      .then((values) => {
        if (!cancelled) {
          setFonts(
            values.filter(
              ({ value }) => value !== "NotoColorEmoji-Regular.ttf",
            ),
          );
          setFontsError(null);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setFonts([]);
          setFontsError(
            cause instanceof Error ? cause.message : "Unable to load fonts",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setPreviewError(null);
    void loadFont(filename, family)
      .then((face) => {
        document.fonts.add(face);
        if (!cancelled) {
          setLoadedFont(filename);
          setPreviewError(null);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setLoadedFont("");
          setPreviewError(
            cause instanceof Error ? cause.message : "Unable to load font",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [family, filename]);

  function set<K extends keyof KeySymbolConfig>(
    key: K,
    value: KeySymbolConfig[K],
  ) {
    onChange({ ...config, [key]: value });
  }

  return (
    <Stack gap="md">
      <Select
        label="Font"
        placeholder="Choose a font"
        searchable
        allowDeselect={false}
        data={fonts}
        value={config.font ?? "Inter_18pt-Regular.ttf"}
        disabled={disabled}
        error={fontsError || previewError || undefined}
        success={!fontsError && !previewError && loadedFont === filename}
        onChange={(value) => value && set("font", value)}
      />
      <Input.Wrapper label="Symbol">
        <Box
          mt="xs"
          role="radiogroup"
          aria-label="Keyboard symbol"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
            gap: 6,
            opacity: disabled ? 0.5 : 1,
            pointerEvents: disabled ? "none" : undefined,
          }}
        >
          {symbols.map(([symbol, label]) => {
            const selected =
              stripPresentation(config.text) === stripPresentation(symbol);
            const displaySymbol = asTextSymbol(symbol);
            return (
              <UnstyledButton
                key={symbol}
                role="radio"
                aria-checked={selected}
                aria-label={label}
                title={label}
                onClick={() => set("text", displaySymbol)}
                style={(theme) => ({
                  aspectRatio: "1",
                  border: `1px solid ${
                    selected ? theme.white : "var(--kbrd-border-color)"
                  }`,
                  borderRadius: theme.radius.xs,
                  backgroundColor: selected ? theme.white : undefined,
                  color: selected ? theme.black : undefined,
                  fontFamily:
                    loadedFont === filename ? family : "KBRD Inter",
                  fontVariantEmoji: "text",
                  fontSize: 20,
                  textAlign: "center",
                })}
              >
                {displaySymbol}
              </UnstyledButton>
            );
          })}
        </Box>
        <Text size="xs" c="dimmed" mt={6}>
          {symbols.find(
            ([symbol]) =>
              stripPresentation(symbol) === stripPresentation(config.text),
          )?.[1] ??
            config.text}
        </Text>
      </Input.Wrapper>
      <Input.Wrapper label="Size" pb="sm">
        <Slider
          mt="xs"
          min={2}
          max={12}
          step={0.1}
          disabled={disabled}
          value={fontSizeValue(config.size)}
          onChange={(value) => set("size", value)}
          marks={fontSizeMarks}
        />
      </Input.Wrapper>
      <ColorInput
        label="Color"
        format="hex"
        value={config.color}
        disabled={disabled}
        error={/^#[0-9a-f]{6}$/i.test(config.color) ? undefined : "Invalid color"}
        success={/^#[0-9a-f]{6}$/i.test(config.color)}
        swatches={swatches}
        closeOnColorSwatchClick
        onChange={(value) => set("color", value)}
      />
      <Placement config={config} onChange={onChange} disabled={disabled} />
    </Stack>
  );
}
