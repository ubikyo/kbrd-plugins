import { MultiSelect, Select, Stack } from "@mantine/core";

import type { BlockProps } from "../../shared/web/blocks/block";
import { useLeadSection } from "../../shared/web/ux/lead";
import NumberField from "../../shared/web/ux/NumberField";
import PropertyGroup from "../../shared/web/ux/PropertyGroup";
import type { KeystrokeConfig } from "./index";

/** The fields this block owns — everything the group's `×` takes away
 * again, exactly as a shared block states its own (see
 * `blocks/Position`'s `POSITION_KEYS`). */
export const ACTION_KEYS = ["keys", "behavior", "durationMs"] as const;

/** How a fresh group sends its keys. Matches the manifest's
 * `defaultConfig`, so adding the group and never touching the control
 * stores the same thing the plugin would have fallen back to. */
export const DEFAULT_BEHAVIOR: KeystrokeConfig["behavior"] = "hold";

/** How long a tap lasts when nothing else is said — the manifest's own
 * default again. */
export const DEFAULT_DURATION_MS = 50;

// What the agent will actually honour: below 10 ms nothing downstream
// reliably sees the key at all, and past 5 s a "tap" is a hold by another
// name. The same window `dev/controller.py` clamps to, so the panel never
// offers a number the device would silently correct.
const DURATION_MIN = 10;
const DURATION_MAX = 5000;

// A USB HID report carries six keys plus eight modifiers, and nothing
// past that is sent — so the field stops offering more rather than
// letting a combination be built that the device would truncate.
const MAX_KEYS = 14;

// The white markers leading these two fields — the same gesture
// `Typography` makes with "Text" (see `useLeadSection`), rather than
// labels of their own outside the fields. No marker on the keys
// themselves: the plugin is called "Keystroke", so a "Keys :" in front of
// the combination would only say it twice.
const BEHAVIOR_LEAD = "Behavior";
const DURATION_LEAD = "Duration";

// Roughly the marker plus the widest value it can be given — "Duration :"
// at `lead.tsx`'s own 6.5px a character, and four digits and a unit after
// it. Approximate, and it can afford to be: the marker itself is measured
// once it's on the page (see `useLeadSection`), so this only decides how
// much empty rule follows the number.
const DURATION_WIDTH = 130;

// The two ways a combination can be sent, as the select carries them.
// "Hold" is the default because it's the one that matches the key itself:
// the combination lasts exactly as long as the press does.
const BEHAVIORS: { value: KeystrokeConfig["behavior"]; label: string }[] = [
  { value: "hold", label: "Hold while pressed" },
  { value: "tap", label: "Tap once" },
];

const modifiers = [
  ["LEFT_CTRL", "Left Ctrl"],
  ["LEFT_SHIFT", "Left Shift"],
  ["LEFT_ALT", "Left Alt"],
  ["LEFT_META", "Left Meta"],
  ["RIGHT_CTRL", "Right Ctrl"],
  ["RIGHT_SHIFT", "Right Shift"],
  ["RIGHT_ALT", "Right Alt"],
  ["RIGHT_META", "Right Meta"],
] as const;

const special = [
  "ENTER", "ESCAPE", "BACKSPACE", "TAB", "SPACE", "DELETE", "INSERT",
  "HOME", "END", "PAGE_UP", "PAGE_DOWN", "UP", "DOWN", "LEFT", "RIGHT",
  "CAPS_LOCK", "NUM_LOCK", "PRINT_SCREEN", "SCROLL_LOCK", "PAUSE",
] as const;

const punctuation = [
  "MINUS", "EQUAL", "LEFT_BRACKET", "RIGHT_BRACKET", "BACKSLASH",
  "SEMICOLON", "APOSTROPHE", "GRAVE", "COMMA", "PERIOD", "SLASH",
] as const;

// Grouped the way a keyboard is read rather than alphabetically: a
// combination is almost always a modifier plus one key, so the modifiers
// lead the list and the letters follow them.
const data = [
  {
    group: "Modifiers",
    items: modifiers.map(([value, label]) => ({ value, label })),
  },
  {
    group: "Letters",
    items: Array.from({ length: 26 }, (_, index) => {
      const value = String.fromCharCode(65 + index);
      return { value, label: value };
    }),
  },
  {
    group: "Numbers",
    items: "1234567890".split("").map((value) => ({ value, label: value })),
  },
  {
    group: "Function keys",
    items: Array.from({ length: 12 }, (_, index) => {
      const value = `F${index + 1}`;
      return { value, label: value };
    }),
  },
  {
    group: "Special keys",
    items: special.map((value) => ({ value, label: value.replaceAll("_", " ") })),
  },
  {
    group: "Punctuation",
    items: punctuation.map((value) => ({ value, label: value.replaceAll("_", " ") })),
  },
];

/**
 * What this plugin does when the key it's attached to is used: which keys
 * to send, and whether they're held for as long as the key is down or
 * tapped for a fixed duration.
 *
 * Keystroke's own, not a shared block: every Invoke plugin has an action,
 * but no two are the same one (a layer to switch to, an application to
 * raise, a combination to send), so there is nothing here for a second
 * plugin to reuse beyond the group itself — see `invoke-application`'s
 * own `Action` for the same reasoning.
 *
 * An *optional* group, like every block in `shared/web/blocks`: a key
 * carries as many actions as it's given — several of the same kind
 * included, each one its own instance, run top to bottom in the order the
 * Properties list shows them — so no single instance is the key's one
 * behaviour, and an instance with its group closed is simply a step that
 * says nothing for the state being edited (its fields come back from the
 * manifest's `defaultConfig`, i.e. no keys, held). Detaching the instance
 * in the Properties list is still what removes the step itself.
 *
 * Needs nothing from KBRD-API: unlike the layer, application and browser
 * lists, the keys a HID report can carry are the same everywhere, so they
 * are stated above rather than fetched.
 */
export default function Action({
  config,
  stored,
  onChange,
  disabled = false,
}: BlockProps<KeystrokeConfig>) {
  const behaviorLead = useLeadSection(BEHAVIOR_LEAD);

  // Every write builds on what's stored, never on the merged view — see
  // `BlockProps`: changing the behaviour must not also freeze today's
  // default duration into the state's own config.
  const write = (patch: Partial<KeystrokeConfig>) =>
    onChange({ ...stored, ...patch });

  function remove() {
    const remaining: Partial<KeystrokeConfig> = { ...stored };
    for (const key of ACTION_KEYS) delete remaining[key];
    onChange(remaining);
  }

  // `keys` is the field the action is actually *about*, so its presence is
  // the group's — a behaviour on its own would leave a group that says
  // nothing. The empty array counts as stored (that's "no keys picked
  // yet", which the field shows as an error); only `undefined` is "not set
  // at all".
  const active = stored.keys !== undefined;

  // An instance carried over from `kbrd.send-keys` may still hold its
  // combination as one `"ctrl+c"` string — the same reading
  // `dev/controller.py` does for the agent's side.
  const keys = Array.isArray(config.keys)
    ? config.keys
    : typeof config.keys === "string"
      ? (config.keys as string).split("+")
      : [];

  // Read once: it picks the select's value *and* whether the duration is
  // asked about at all, and those two must never disagree.
  const behavior = config.behavior === "tap" ? "tap" : "hold";
  const durationMs = config.durationMs ?? DEFAULT_DURATION_MS;

  return (
    <PropertyGroup
      title="Action"
      active={active}
      onAdd={() =>
        write({
          // No combination to seed on the user's behalf: unlike a layer or
          // a browser, there is no "first key" that would be the obvious
          // answer, so the group opens on its own error and says what it
          // wants.
          keys,
          behavior: config.behavior ?? DEFAULT_BEHAVIOR,
          durationMs: config.durationMs ?? DEFAULT_DURATION_MS,
        })
      }
      onRemove={remove}
    >
      <Stack gap="xs">
        {/* No marker: the plugin is called "Keystroke", so the field is
            the point of the panel rather than one answer among several —
            the same bargain `invoke-layer` makes with its layer select. */}
        <MultiSelect
          variant="unstyled"
          size="xs"
          w="100%"
          aria-label="Keys"
          placeholder="Select a key combination"
          searchable
          clearable
          data={data}
          value={keys}
          maxValues={MAX_KEYS}
          disabled={disabled}
          onChange={(next) => write({ keys: next })}
          // The clear button is a `CloseButton`, which paints its own
          // colour rather than inheriting the field's — so white has to be
          // said here rather than in `styles`.
          clearButtonProps={{ c: "white" }}
          styles={(theme) => ({
            input: { paddingInlineEnd: 14 },
            pill: {
              borderRadius: 5,
              backgroundColor: theme.white,
              color: theme.black,
            },
          })}
        />
        {/* The marker leads the field itself rather than labelling it from
            outside, exactly as `Typography` leads its own text with
            "Text": the answer follows the marker on the one line, so the
            row reads as a sentence instead of a label meeting its answer
            somewhere in the middle. */}
        <Select
          variant="unstyled"
          size="xs"
          w="100%"
          aria-label="Behavior"
          leftSection={behaviorLead.section}
          // Decorative: the field's accessible name is its `aria-label`,
          // and a click on the marker is meant for the field — see
          // `useLeadSection`.
          leftSectionPointerEvents="none"
          allowDeselect={false}
          data={BEHAVIORS}
          value={behavior}
          disabled={disabled}
          onChange={(value) =>
            write({ behavior: value === "tap" ? "tap" : "hold" })
          }
          // The same two corrections every `unstyled` select in these
          // panels needs (see `ux/UnitSelect`): no padding of its own to
          // keep the chevron off the text, and a section that would
          // otherwise be as wide as the field is tall — plus the room the
          // marker itself takes at the start, which an `unstyled` input
          // has none of its own to build on.
          styles={{
            input: {
              paddingInlineStart: behaviorLead.room,
              paddingInlineEnd: 14,
            },
            section: { width: "auto" },
          }}
        />
        {/* Only asked about for a tap: a held combination lasts exactly as
            long as the key is down, so there would be nothing for a
            duration to say about it. */}
        {behavior === "tap" && (
          <NumberField
            aria-label="Duration"
            lead={DURATION_LEAD}
            // Milliseconds, said in the field itself: nothing about a
            // number between 10 and 5000 hints at the unit — the same
            // gesture `Typography` makes with its " mm".
            suffix=" ms"
            width={DURATION_WIDTH}
            min={DURATION_MIN}
            max={DURATION_MAX}
            value={durationMs}
            disabled={disabled}
            onChange={(next) => write({ durationMs: next })}
          />
        )}
      </Stack>
    </PropertyGroup>
  );
}
