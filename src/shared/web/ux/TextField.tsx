import { TextInput } from "@mantine/core";

import { useLeadSection } from "./lead";

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
}: Props) {
  const { section, room } = useLeadSection(lead);

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
      onChange={(event) => onChange(event.currentTarget.value)}
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
