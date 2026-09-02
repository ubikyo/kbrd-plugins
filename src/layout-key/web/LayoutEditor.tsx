import { Select } from "@mantine/core";

import type { LayoutKeyConfig } from "./index";
import PropertyRow from "../../shared/web/PropertyRow";

type Props = {
  config: LayoutKeyConfig;
  onChange: (value: LayoutKeyConfig) => void;
  disabled?: boolean;
};

// Moved here from <Inspector>'s hardcoded system properties: momentary/toggle
// is now a Key-element property like any other, edited through this plugin.
export default function LayoutEditor({
  config,
  onChange,
  disabled = false,
}: Props) {
  return (
    <PropertyRow label="Type">
      <Select
        w="100%"
        aria-label="Type"
        size="xs"
        allowDeselect={false}
        data={[
          { value: "momentary", label: "Momentary" },
          { value: "toggle", label: "Toggle" },
        ]}
        value={config.keyMode ?? "momentary"}
        disabled={disabled}
        success
        onChange={(value) =>
          onChange({
            ...config,
            keyMode: value === "toggle" ? "toggle" : "momentary",
          })
        }
      />
    </PropertyRow>
  );
}
