import { Text } from "@mantine/core";

/**
 * Layout form for plugins that have nothing to position — action plugins
 * aren't drawn on the key, so there's no placement to configure. Kept as a
 * single shared component rather than duplicated per plugin.
 */
export default function EmptyLayoutEditor() {
  return (
    <Text size="sm" c="dimmed">
      This plugin has no layout properties.
    </Text>
  );
}
