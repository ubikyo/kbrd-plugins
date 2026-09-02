import { Text } from "@mantine/core";

/**
 * Mapping form for plugins that have nothing to map — Layout plugins
 * describe positioning/kind, not behaviour or rendered content, so there's
 * nothing to configure here. Kept as a single shared component rather than
 * duplicated per plugin.
 */
export default function EmptyMappingEditor() {
  return (
    <Text size="sm" c="dimmed">
      This plugin has no mapping properties.
    </Text>
  );
}
