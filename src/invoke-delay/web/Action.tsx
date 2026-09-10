import { Group, Select } from "@mantine/core";

import type { BlockProps } from "../../shared/web/blocks/block";
import NumberField from "../../shared/web/ux/NumberField";
import PropertyGroup from "../../shared/web/ux/PropertyGroup";
import type { DelayConfig, DelayUnit } from "./index";

/** The fields this block owns — everything the group's `×` takes away
 * again, exactly as a shared block states its own (see
 * `blocks/Position`'s `POSITION_KEYS`). */
export const ACTION_KEYS = ["delay", "delayUnit"] as const;

/** What a fresh group waits, and in what. Matches the manifest's
 * `defaultConfig`, so adding the group and never touching the controls
 * stores the same thing the plugin would have fallen back to. */
export const DEFAULT_DELAY = 200;
export const DEFAULT_DELAY_UNIT: DelayUnit = "ms";

/**
 * The units a delay can be given in, each stored as its own symbol and
 * shown as the shortcut English writes it with — "sec" and "hr" rather
 * than the bare SI `s` and `h`, which read as initials next to a number
 * in a panel this small. The stored value stays the symbol, so nothing
 * downstream has to know which spelling the panel happens to use.
 *
 * Order is the dropdown's own, so the default reads as the default by
 * leading the list.
 */
const DELAY_UNITS: { value: DelayUnit; label: string }[] = [
  { value: "ms", label: "ms" },
  { value: "s", label: "sec" },
  { value: "min", label: "min" },
  { value: "h", label: "hr" },
];

/** How much of each unit a single step can be asked to wait: a day's
 * worth, whichever unit says it. One ceiling rather than four unrelated
 * ones — a step that holds the key's whole list up for longer than that
 * is a mistake in any unit. */
const DELAY_MAX: Record<DelayUnit, number> = {
  ms: 86_400_000,
  s: 86_400,
  min: 1_440,
  h: 24,
};

// A delay is required (see this file's own docblock), and zero is a step
// that does nothing — so the field's floor is the shortest wait that
// still is one.
const DELAY_MIN = 1;

// What the digits themselves need, like every other numeric field in
// these panels (`blocks/Dimension`'s own 48, `Typography`'s 63): sized to
// its value rather than to the row, so the unit follows the number
// instead of meeting it across an empty rule.
const DELAY_WIDTH = 50;

// Same width as `ux/UnitSelect`'s own dropdown: this is the same gesture
// — the unit a number beside it is counted in — and the two shouldn't
// differ by a few pixels from panel to panel.
const UNIT_WIDTH = 66;

const isUnit = (value: unknown): value is DelayUnit =>
  DELAY_UNITS.some((unit) => unit.value === value);

/**
 * What this plugin does when the key it's attached to is used: nothing,
 * for as long as it's told to.
 *
 * A key carries as many Invoke plugins as it's given, run top to bottom
 * in the order the Properties list shows them, so a delay is a step like
 * any other — it just holds the ones after it back rather than doing
 * something of its own. Which is why it has no "on press / on release"
 * question the way `invoke-layer` does: the wait happens where the step
 * sits in the list, and moving it by its grip is what moves the wait.
 *
 * Delay's own block, not a shared one: every Invoke plugin has an action,
 * but no two are the same one (a layer to switch to, a combination to
 * send, a wait to sit out), so there is nothing here for a second plugin
 * to reuse beyond the group itself — see `invoke-application`'s own
 * `Action` for the same reasoning.
 *
 * An *optional* group, like every block in `shared/web/blocks`: an
 * instance with its group closed is simply a step that says nothing for
 * the state being edited (its fields come back from the manifest's
 * `defaultConfig`, i.e. the 200 ms below). Detaching the instance in the
 * Properties list is still what removes the step itself.
 *
 * The duration itself is *required* once the group is open: a delay with
 * no number is not a shorter delay, it's a step with nothing to do — so
 * the field can't be left empty (it comes back to its last value, see
 * `NumberField`) and says so outright for a config that arrives without
 * one.
 */
export default function Action({
  config,
  stored,
  onChange,
  disabled = false,
}: BlockProps<DelayConfig>) {
  // Every write builds on what's stored, never on the merged view — see
  // `BlockProps`: changing the unit must not also freeze today's default
  // duration into the state's own config.
  const write = (patch: Partial<DelayConfig>) =>
    onChange({ ...stored, ...patch });

  function remove() {
    const remaining: Partial<DelayConfig> = { ...stored };
    for (const key of ACTION_KEYS) delete remaining[key];
    onChange(remaining);
  }

  // `delay` is the field the action is actually *about*, so its presence
  // is the group's — a unit on its own would leave a group that says
  // nothing.
  const active = stored.delay !== undefined;

  const unit = isUnit(config.delayUnit) ? config.delayUnit : DEFAULT_DELAY_UNIT;
  // Only a real number is a duration: anything else is a config that
  // arrived without one, which the field below says out loud rather than
  // quietly standing in the default for.
  const given =
    typeof config.delay === "number" && Number.isFinite(config.delay);
  // What the unit's ceiling is measured against, and what a unit change
  // carries over: the default stands in while nothing has been given, so
  // neither has to ask again whether there is a number at all.
  const delay = given ? config.delay : DEFAULT_DELAY;

  return (
    <PropertyGroup
      title="Action"
      active={active}
      onAdd={() =>
        // Both values already on show — the manifest's 200 ms, unless
        // something was set — so opening the group waits what it says it
        // waits rather than needing an answer first.
        write({ delay, delayUnit: unit })
      }
      onRemove={remove}
    >
      {/* Top-aligned rather than centred: the number field grows
          downwards when it has an error to show, and the unit beside it
          has to stay on the same top edge while it does. Neither one
          takes the row: they are as wide as what they hold, the way
          `blocks/Dimension` sizes its own pair. */}
      <Group gap="xs" wrap="nowrap" align="flex-start">
        {/* No marker leading the number: the plugin is called "Set a
            delay" and the unit sits on its right, so a "Delay :" in
            front of it would only say it a third time — the same bargain
            `invoke-layer` makes with its layer select. */}
        <NumberField
          aria-label="Delay"
          width={DELAY_WIDTH}
          min={DELAY_MIN}
          max={DELAY_MAX[unit]}
          // Left empty rather than showing the default it doesn't have:
          // the red line under it is what says the field wants a number,
          // and a 200 sitting in it would contradict that.
          value={given ? config.delay : ""}
          disabled={disabled}
          error={given ? undefined : "Enter a delay"}
          onChange={(next) => write({ delay: next })}
        />
        {/* Bare like every other field in these rows (the `unstyled`
            variant, no label of its own beyond `aria-label`) — see
            `ux/UnitSelect`, which is this same control for the one pair
            of units it serves. */}
        <Select
          variant="unstyled"
          size="xs"
          w={UNIT_WIDTH}
          aria-label="Delay unit"
          allowDeselect={false}
          data={DELAY_UNITS}
          value={unit}
          disabled={disabled}
          // The number stays what it says — 200 in one unit is 200 in the
          // next, not a converted 0 the field's whole numbers couldn't
          // hold anyway — but it can't outlive the new unit's own ceiling
          // (a day, see `DELAY_MAX`), so it's brought back to it.
          onChange={(value) => {
            if (!isUnit(value) || value === unit) return;
            write({
              delayUnit: value,
              delay: Math.min(delay, DELAY_MAX[value]),
            });
          }}
          // The same two corrections every `unstyled` select in these
          // panels needs (see `ux/UnitSelect`): no padding of its own to
          // keep the chevron off the text, and a section that would
          // otherwise be as wide as the field is tall — most of these
          // 66px.
          styles={{
            input: { paddingInlineEnd: 14 },
            section: { width: "auto" },
          }}
        />
      </Group>
    </PropertyGroup>
  );
}
