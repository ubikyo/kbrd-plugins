import { Select } from "@mantine/core";

/** What a coordinate or a size is counted in: a share of the cell it sits
 * in, or an absolute distance in the display's own unit (see
 * `LayoutSettings.unit` in kbrd-web — millimetres, or pixels for a
 * pixel-measured display). */
export type Unit = "mm" | "%";

/** The unit a group seeds itself with: percentages, the only thing the
 * coordinates and sizes stored before this was configurable ever meant. */
export const DEFAULT_UNIT: Unit = "%";

// Order is the dropdown's own, so the default reads as the default by
// leading the list.
const UNITS: Unit[] = ["%", "mm"];

/** Where each unit's own numbers start from — the middle of the cell as a
 * percentage, its leading edge in millimetres (any other seed would be a
 * guess about a cell size the editors never see). */
export const UNIT_ORIGIN: Record<Unit, number> = { "%": 50, mm: 0 };

/** How far each unit's own numbers go: a percentage stops at the cell's
 * far edge, while a millimetre offset has no cell size here to stop at,
 * so it gets the same generous three-digit ceiling the font size has. */
export const UNIT_MAX: Record<Unit, number> = { "%": 100, mm: 999 };

type Props = {
  value: Unit;
  onChange: (value: Unit) => void;
  disabled?: boolean;
  "aria-label": string;
};

/**
 * The `%` / `mm` dropdown leading a pair of numeric property fields —
 * shown once for both, since an X in millimetres beside a Y in percent
 * would be two different coordinate systems for one point.
 *
 * Bare like every other field in these rows (the `unstyled` variant, no
 * label of its own beyond `aria-label`) — see `Color` for the same
 * bargain.
 */
export default function UnitSelect({
  value,
  onChange,
  disabled = false,
  "aria-label": ariaLabel,
}: Props) {
  return (
    <Select
      variant="unstyled"
      size="xs"
      w={66}
      aria-label={ariaLabel}
      allowDeselect={false}
      data={UNITS}
      value={value}
      disabled={disabled}
      onChange={(next) => next && onChange(next as Unit)}
      // Same two corrections `Border`'s own style dropdown needs: an
      // `unstyled` field has no padding of its own to keep the chevron off
      // the text, and its section would otherwise be as wide as the field
      // is tall — most of these 66px.
      styles={{
        input: { paddingInlineEnd: 14 },
        section: { width: "auto" },
      }}
    />
  );
}
