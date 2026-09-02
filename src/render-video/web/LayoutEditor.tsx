import { Stack, Switch, Text } from "@mantine/core";

import type { VideoConfig } from "./index";
import PropertyRow from "../../shared/web/PropertyRow";

type Props = {
  config: VideoConfig;
  onChange: (value: VideoConfig) => void;
  disabled?: boolean;
  targetType?: "key" | "background" | "space";
};

export default function LayoutEditor({
  config,
  onChange,
  disabled = false,
  targetType,
}: Props) {
  if (targetType !== "key") {
    return (
      <Text size="sm" c="dimmed">
        This plugin has no layout properties here.
      </Text>
    );
  }

  return (
    <Stack gap="md">
      <PropertyRow
        label="Allow overflow outside the key"
        description="Keeps the video centered without clipping it to the key."
        compactControl
      >
        <Switch
          aria-label="Allow overflow outside the key"
          checked={config.unconstrained ?? false}
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...config, unconstrained: event.currentTarget.checked })
          }
        />
      </PropertyRow>
    </Stack>
  );
}
