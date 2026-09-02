import { Select, Stack } from "@mantine/core";
import { useEffect, useState } from "react";

import type { WorkspaceConfig } from "./index";
import PropertyRow from "../../shared/web/PropertyRow";

type Option = { value: string; label: string };
type Geometry = { id: number; name: string };
type Workspace = { id: number; geometry_id: number; name: string };

async function fetchOptions<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(payload.error || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetchOptions<Geometry[]>("/api/geometry"),
      fetchOptions<Workspace[]>("/api/workspace"),
    ]).then(([geometries, workspaces]) => {
      if (cancelled) return;
      const names = new Map(geometries.map((item) => [item.id, item.name]));
      setOptions(
        workspaces.map((item) => ({
          value: String(item.id),
          label: `${names.get(item.geometry_id) ?? "Geometry"} / ${item.name}`,
        })),
      );
      setError(null);
    }).catch((cause: unknown) => {
      if (!cancelled) {
        setOptions([]);
        setError(
          cause instanceof Error ? cause.message : "Unable to load workspaces",
        );
      }
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <Stack gap="md">
      <PropertyRow label="Workspace">
        <Select
          w="100%"
          size="xs"
          searchable
          placeholder="Select"
          data={options}
          value={config.workspaceId == null ? null : String(config.workspaceId)}
          disabled={disabled}
          error={
            error ||
            (config.workspaceId == null ? "Select a workspace" : undefined)
          }
          success={!error && config.workspaceId != null}
          onChange={(value) =>
            onChange({ ...config, workspaceId: value ? Number(value) : null })
          }
        />
      </PropertyRow>
      <PropertyRow label="Event">
        <Select
          w="100%"
          size="xs"
          allowDeselect={false}
          data={[{ value: "down", label: "Down" }, { value: "up", label: "Up" }]}
          value={config.event ?? "down"}
          disabled={disabled}
          success
          onChange={(value) =>
            onChange({ ...config, event: value === "up" ? "up" : "down" })
          }
        />
      </PropertyRow>
    </Stack>
  );
}
