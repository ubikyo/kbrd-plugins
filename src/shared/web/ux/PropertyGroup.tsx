import { ActionIcon, Box, Collapse, Group, Text } from "@mantine/core";
import { useEffect, useState, type ReactNode } from "react";

type Props = {
  title: string;
  // The property's own editor — only ever mounted while `active`, so it
  // never has to handle being asked to render a config that doesn't
  // exist yet.
  children: ReactNode;
} & (
  | {
      // An optional group: the three come as a set, and the header gets
      // its `+`/`×` from them.
      //
      // `active` is whether this property actually exists in the parent's
      // own configuration right now — not a visual "is it open" flag (see
      // `expanded` below, and this component's own module docblock).
      active: boolean;
      // Creates the property in the parent's configuration — e.g. seeding
      // a fresh `autoLayout: {...}` object. Must be a real write, not just
      // a visual toggle: `active` becoming `true` is expected to come from
      // this having actually landed in the config, on the next render.
      onAdd: () => void;
      // Removes the property from the parent's configuration (deletes the
      // key, or sets it to `undefined` — whichever this project's data
      // model already uses elsewhere for "this optional property isn't
      // set").
      onRemove: () => void;
    }
  | {
      // A permanent group: nothing to add or remove, so the header is the
      // title alone and the content is always on show. What a plugin's
      // *own* subject is rather than an optional extra over it — an
      // invoke plugin's action, say, which is the whole of why the
      // instance is attached at all.
      active?: never;
      onAdd?: never;
      onRemove?: never;
    }
);

const GROUP_BORDER_STYLE = "1px solid var(--kbrd-border-color)";

/**
 * One optional, addable/removable property group in a Properties-style
 * panel — Figma's own "group header with a +/× button" pattern. Generic
 * on purpose: it owns none of the property-specific logic (what
 * `autoLayout`/`border`/`text`/... actually contains) — only its own
 * header (title, `+`/`×`) and whether its content is expanded. The
 * property's real presence lives entirely in the parent's own
 * configuration, which is why `onAdd`/`onRemove` are real mutations the
 * parent performs, not local state this component could fake — see this
 * file's own `active` prop doc.
 *
 * Stating none of `active`/`onAdd`/`onRemove` makes a permanent group
 * instead: the same header and framing, no `+`/`×`, content always on
 * show — for a group that *is* the plugin's own subject rather than an
 * optional extra over it (see `Props`).
 *
 * `active` (does the property exist) and `expanded` (is the content
 * panel visually open) are deliberately kept distinct, even though today
 * one always drives the other one-to-one (adding opens it, removing
 * closes it) — so a later gesture that only changes one of them (e.g.
 * collapsing an active group's content without removing the property)
 * doesn't need a rewrite, just a new way to call `setExpanded`.
 */
export default function PropertyGroup(props: Props) {
  const { title, children, onAdd, onRemove } = props;
  // A permanent group states none of the three, and is exactly a group
  // whose property is always there (see `Props`).
  const active = props.active ?? true;
  const [expanded, setExpanded] = useState(active);
  // An open group's `×` only shows while the pointer is over the button
  // itself — removing a property is a deliberate gesture, and a row of
  // always-on delete buttons reads as noisier than the panel deserves.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  // Keeps `expanded` following `active` for any change that didn't come
  // through this component's own buttons — e.g. the property existing
  // already on first mount (loaded from a saved config), or the parent
  // clearing it some other way.
  useEffect(() => {
    setExpanded(active);
  }, [active]);

  function handleAdd() {
    onAdd?.();
    setExpanded(true);
  }

  function handleRemove() {
    onRemove?.();
    setExpanded(false);
  }

  // Whether the content panel is actually on show — the state the header
  // tightens up against (see its own `py` below). Both halves matter:
  // `expanded` alone can be true for a property that isn't there.
  const open = active && expanded;

  return (
    <Box style={{ borderBottom: GROUP_BORDER_STYLE, borderRadius: 0 }}>
      <Group
        justify="space-between"
        wrap="nowrap"
        gap="xs"
        py={10}
        px={15}
        pr={10}
        // Tighter while open: the content below brings its own spacing, so
        // the full height only earns its keep on a closed group, where the
        // header is the whole row.
        pb={open ? 5 : 10}
      >
        <Text
          size="xs"
          fw={600}
          tt="uppercase"
          c="dimmed"
          style={{ letterSpacing: "0.04em" }}
        >
          {title}
        </Text>
        {/* Nothing to draw on a permanent group — see `Props`. */}
        {!onAdd && !onRemove ? null : active ? (
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            radius={0}
            aria-label={`Remove ${title}`}
            onClick={handleRemove}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              backgroundColor: "var(--kbrd-color-surface)",
              // Faded out rather than hidden or unmounted: `opacity` keeps
              // the button laid out *and* hit-testable, which is what lets
              // hovering its own spot be the thing that reveals it. Focus
              // counts too, so it stays reachable by keyboard.
              opacity: hovered || focused ? 1 : 0,
            }}
          >
            <Text size="sm" span>
              ×
            </Text>
          </ActionIcon>
        ) : (
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            radius={0}
            aria-label={`Add ${title}`}
            onClick={handleAdd}
          >
            <Text size="sm" span>
              +
            </Text>
          </ActionIcon>
        )}
      </Group>
      {active && (
        <Collapse expanded={expanded}>
          <Box pr="15" pl="15" pt="0" pb="15">
            {children}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}
