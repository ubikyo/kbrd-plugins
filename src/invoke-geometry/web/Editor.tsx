import { Group, Select, Stack, Text } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";

import type { GeometryConfig } from "./index";

type Geometry = { id: number; name: string };
type Workspace = { id: number; geometry_id: number; name: string };

export default function Editor({
  config,
  onChange,
  disabled = false,
}: {
  config: GeometryConfig;
  onChange: (value: GeometryConfig) => void;
  disabled?: boolean;
}) {
  const [geometries, setGeometries] = useState<Geometry[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetch("/api/geometry").then(
        (response) => response.json() as Promise<Geometry[]>,
      ),
      fetch("/api/workspace").then(
        (response) => response.json() as Promise<Workspace[]>,
      ),
    ])
      .then(([geometryItems, workspaceItems]) => {
        if (!cancelled) {
          setGeometries(geometryItems);
          setWorkspaces(workspaceItems);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGeometries([]);
          setWorkspaces([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const geometryOptions = useMemo(
    () =>
      geometries.map((item) => ({
        value: String(item.id),
        label: item.name,
      })),
    [geometries],
  );
  const workspaceOptions = useMemo(
    () =>
      workspaces
        .filter((item) => item.geometry_id === config.geometryId)
        .map((item) => ({ value: String(item.id), label: item.name })),
    [config.geometryId, workspaces],
  );

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="nowrap">
        <Text size="sm">Geometry</Text>
        <Select
          w={160}
          size="xs"
          searchable
          placeholder="Select"
          data={geometryOptions}
          value={config.geometryId == null ? null : String(config.geometryId)}
          disabled={disabled}
          onChange={(value) =>
            onChange({
              ...config,
              geometryId: value ? Number(value) : null,
              workspaceId: null,
            })
          }
        />
      </Group>
      <Group justify="space-between" wrap="nowrap">
        <Text size="sm">Workspace</Text>
        <Select
          w={160}
          size="xs"
          searchable
          clearable
          placeholder="No workspace"
          data={workspaceOptions}
          value={
            config.workspaceId == null ? null : String(config.workspaceId)
          }
          disabled={disabled || config.geometryId == null}
          onChange={(value) =>
            onChange({
              ...config,
              workspaceId: value ? Number(value) : null,
            })
          }
        />
      </Group>
      <Group justify="space-between" wrap="nowrap">
        <Text size="sm">Event</Text>
        <Select
          w={160}
          size="xs"
          allowDeselect={false}
          data={[
            { value: "down", label: "Down" },
            { value: "up", label: "Up" },
          ]}
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
