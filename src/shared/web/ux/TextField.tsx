import { TextInput } from "@mantine/core";

import { useLeadSection } from "./lead";

/** Where the caret is, or what is selected, in UTF-16 offsets — the
 * field's own units. `start === end` is a caret rather than a selection. */
export type TextSelection = { start: number; end: number };

type Props = {
  value: string;
  onChange: (value: string) => void;
  // A short white marker shown at the start of the field — "Text" — see
  // `useLeadSection` for what it is and why it isn't Mantine's own
  // prefix. The gap between it and the value is the same for every field
  // in these panels, so there's nothing per-field to set here.
  lead?: string;
  placeholder?: string;
  disabled?: boolean;
  "aria-label": string;
  // What the caret or selection is doing, for a field whose *part* can be
  // acted on — the Typography block, whose emphases apply to the selected
  // characters alone. `null` means the field isn't focused, and the
  // caller should fall back to treating the whole value as addressed.
  //
  // Reported from three events rather than one: `select` covers dragging
  // and select-all, `keyUp` the arrow keys walking the caret through the
  // text, and `click` a plain caret placement. They overlap heavily, and
  // that is the point — between them there is no way to move the caret
  // that goes unreported.
  onSelectionChange?: (selection: TextSelection | null) => void;
};

/**
 * A bare Mantine `TextInput` for the compact property rows — the
 * `unstyled` variant, no background or border of its own, and no visible
 * label (only `aria-label`, for accessibility). The same bargain as
 * `Color` and `NumberField`, and like them it picks up the bottom border
 * the Properties tab draws under an unstyled input.
 *
 * Unlike `NumberField` it keeps no draft of its own: a text field's empty
 * string is a value in its own right, not a keystroke on the way
 * somewhere, so it goes straight up.
 */
export default function TextField({
  value,
  onChange,
  lead,
  placeholder,
  disabled = false,
  "aria-label": ariaLabel,
  onSelectionChange,
}: Props) {
  const { section, room } = useLeadSection(lead);

  const report = (input: HTMLInputElement) =>
    onSelectionChange?.({
      start: input.selectionStart ?? 0,
      end: input.selectionEnd ?? 0,
    });

  return (
    <TextInput
      variant="unstyled"
      size="xs"
      w="100%"
      aria-label={ariaLabel}
      placeholder={placeholder}
      leftSection={section}
      leftSectionPointerEvents="none"
      value={value}
      disabled={disabled}
      onChange={(event) => {
        onChange(event.currentTarget.value);
        // After the change rather than before: typing moves the caret,
        // and a row of buttons reading the character to its left has to
        // be told about the character that was just typed.
        report(event.currentTarget);
      }}
      onSelect={(event) => report(event.currentTarget)}
      onKeyUp={(event) => report(event.currentTarget)}
      onClick={(event) => report(event.currentTarget)}
      onFocus={(event) => report(event.currentTarget)}
      // Leaving the field addresses the whole value again — see
      // `onSelectionChange`.
      onBlur={() => onSelectionChange?.(null)}
      styles={{
        input: {
          background: "none",
          border: "none",
          paddingInlineStart: room,
        },
        // Shrunk to the marker instead of being as wide as the field is
        // tall, which is what an untouched section would be — see `Color`.
        section: { width: "auto" },
      }}
    />
  );
}
