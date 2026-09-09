import { Box } from "@mantine/core";
import { useState, type ReactNode } from "react";

/**
 * The two harnesses every story in this package is built on. Story-only:
 * nothing here is listed in `package.json`'s `exports`, so KBRD-WEB can't
 * reach it — it exists so a story shows a *working* control rather than a
 * frozen screenshot of one.
 */

/**
 * Holds one value for a controlled leaf control (`ux/`) — the `value` /
 * `onChange` pair every one of them takes.
 *
 * Storybook's args can't do this on their own: an arg is read-only from
 * the story's side, so a control wired straight to one never moves when
 * clicked. The state lives here instead, seeded from whatever the story
 * passes.
 */
export function Controlled<T>({
  initial,
  children,
}: {
  initial: T;
  children: (value: T, onChange: (value: T) => void) => ReactNode;
}) {
  const [value, setValue] = useState<T>(initial);
  return <>{children(value, setValue)}</>;
}

/**
 * What a property block (`blocks/`) needs around it, which is more than
 * one value: the host hands a block both the *merged* view (`config` —
 * the plugin's `defaultConfig` under whatever the instance stores) and
 * the *stored* slice on its own (`stored`), and the difference between
 * them is exactly what a group's own +/× state means. See `BlockProps`.
 *
 * `onChange` replaces the stored config wholesale rather than merging
 * into it — that's the real contract (`Inspector.tsx` feeds it straight
 * to `withStateConfig`), and it has to be, or a block's `×` could never
 * delete a key.
 *
 * The stored slice is shown beside the block so a story makes the
 * distinction visible: adding a group writes keys, removing it takes them
 * away again, and the merged values on screen never change from either.
 */
export function BlockHarness<T extends object>({
  defaults,
  initialStored = {},
  children,
}: {
  defaults: T;
  initialStored?: Partial<T>;
  children: (props: {
    config: T;
    stored: Partial<T>;
    onChange: (value: Partial<T>) => void;
  }) => ReactNode;
}) {
  const [stored, setStored] = useState<Partial<T>>(initialStored);

  return (
    <Box style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      <Box style={{ width: 300, flexShrink: 0 }}>
        {children({
          config: { ...defaults, ...stored },
          stored,
          onChange: setStored,
        })}
      </Box>
      <Box
        component="pre"
        style={{
          margin: 0,
          padding: 12,
          minWidth: 220,
          fontSize: 11,
          lineHeight: 1.5,
          color: "#9a9a9a",
          border: "1px solid var(--kbrd-border-color)",
          backgroundColor: "var(--kbrd-color-surface)",
        }}
      >
        {`stored = ${JSON.stringify(stored, null, 2)}`}
      </Box>
    </Box>
  );
}
