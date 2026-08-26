import { Group, Select, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";

import type { WorkspaceConfig } from "./index";

type Option = { value: string; label: string };
type Geometry = { id: number; name: string };
type Workspace = { id: number; geometry_id: number; name: string };

export default function Editor({
  config,
  onChange,
  disabled = false,
}: {
  config: WorkspaceConfig;
  onChange: (value: WorkspaceConfig) => void;
  disabled?: boolean;
}) {
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetch("/api/geometry").then((response) => response.json() as Promise<Geometry[]>),
      fetch("/api/workspace").then((response) => response.json() as Promise<Workspace[]>),
    ]).then(([geometries, workspaces]) => {
      if (cancelled) return;
      const names = new Map(geometries.map((item) => [item.id, item.name]));
      setOptions(
        workspaces.map((item) => ({
          value: String(item.id),
          label: `${names.get(item.geometry_id) ?? "Geometry"} / ${item.name}`,
        })),
      );
    }).catch(() => {
      if (!cancelled) setOptions([]);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="nowrap">
        <Text size="sm">Workspace</Text>
        <Select
          w={160}
          size="xs"
          searchable
          placeholder="Select"
          data={options}
          value={config.workspaceId == null ? null : String(config.workspaceId)}
          disabled={disabled}
          onChange={(value) =>
            onChange({ ...config, workspaceId: value ? Number(value) : null })
          }
        />
      </Group>
      <Group justify="space-between" wrap="nowrap">
        <Text size="sm">Event</Text>
        <Select
          w={160}
          size="xs"
          allowDeselect={false}
          data={[{ value: "down", label: "Down" }, { value: "up", label: "Up" }]}
          value={config.event ?? "down"}
          disabled={disabled}
          onChange={(value) =>
            onChange({ ...config, event: value === "up" ? "up" : "down" })
          }
        />
      </Group>
    </Stack>
  );
}
