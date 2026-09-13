import { Text } from "@mantine/core";

/**
 * Layer form for plugins that have nothing to map — Layout plugins
 * describe positioning/kind, not behaviour or rendered content, so there's
 * nothing to configure here. Kept as a single shared component rather than
 * duplicated per plugin.
 *
 * Padded like a block's own header (`PropertyGroup` uses the same 10/15),
 * because that is what it stands in for: the panels it appears in draw no
 * padding of their own — `.property-editor-panel` zeroes the accordion's,
 * and Layout mode's `LayoutCellProperties` never had any — so every block
 * insets itself and this has to as well, or the one plugin with nothing to
 * configure is the one whose text runs into the panel's edge.
 */
export default function EmptyLayerEditor() {
  return (
    <Text size="sm" c="dimmed" px={15} py={10}>
      This plugin has no layer properties.
    </Text>
  );
}
