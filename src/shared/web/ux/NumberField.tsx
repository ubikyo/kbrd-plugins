import { NumberInput } from "@mantine/core";
import { useEffect, useState, type ReactNode } from "react";

import { leadRoom, leadSection } from "./lead";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max?: number;
  // No default: these fields are sized to the digits they hold, and only
  // the caller knows how many that is (see `Color`'s own `w` for why a
  // block-level input has to be told).
  width: number | string;
  // A short white marker shown at the start of the field — "X", "Y", or a
  // small icon — see `leadSection` for what it is and why it isn't
  // Mantine's `prefix`.
  lead?: ReactNode;
  // Extra room after that marker, on top of the room its own length earns
  // it — see `leadRoom`.
  leadGap?: number;
  // Rendered inside the field, after the number — "%" and the like.
  suffix?: string;
  disabled?: boolean;
  "aria-label": string;
};

/**
 * A bare Mantine `NumberInput` for the compact property rows — the
 * `unstyled` variant, no background or border of its own, and no visible
 * label (only `aria-label`, for accessibility). Same bargain as `Color`.
 *
 * Why it exists rather than each caller spelling out its own: a
 * controlled `NumberInput` whose `onChange` throws away the empty string
 * can never *look* empty, so clearing it snaps the old digits straight
 * back and leaves the caret beside a number nothing can remove — worst of
 * all when that number is `0`, which every backspace lands on and every
 * keystroke then merely prefixes. So the field keeps its own draft: going
 * empty is allowed and simply reports nothing upwards, and the last real
 * value comes back when focus leaves.
 */
export default function NumberField({
  value,
  onChange,
  min,
  max,
  width,
  lead,
  leadGap,
  suffix,
  disabled = false,
  "aria-label": ariaLabel,
}: Props) {
  const [draft, setDraft] = useState<string | number>(value);

  // Follows the value whenever it changes from somewhere else — another
  // state selected in the Properties tab, a config loaded in. While
  // typing, the two are already equal, so this never fights the draft.
  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <NumberInput
      variant="unstyled"
      size="xs"
      w={width}
      aria-label={ariaLabel}
      min={min}
      max={max}
      // Typing past either end lands back on the bound rather than being
      // left there to be rejected later.
      clampBehavior="strict"
      allowDecimal={false}
      allowNegative={false}
      leftSection={leadSection(lead)}
      leftSectionPointerEvents="none"
      suffix={suffix}
      hideControls
      value={draft}
      disabled={disabled}
      onChange={(next) => {
        setDraft(next);
        // An emptied field is a keystroke on its way somewhere, not a
        // value: held locally, reported to nobody.
        if (next === "") return;
        const parsed = typeof next === "number" ? next : Number(next);
        if (Number.isFinite(parsed)) onChange(parsed);
      }}
      // Whatever half-finished text is in there loses to the real value
      // once the field is done being edited.
      onBlur={() => setDraft(value)}
      styles={{
        input: {
          background: "none",
          border: "none",
          paddingInlineStart: leadRoom(lead, leadGap),
        },
        // Shrunk to the marker instead of being as wide as the field is
        // tall, which is what an untouched section would be — see `Color`.
        section: { width: "auto" },
      }}
    />
  );
}
