import { Select, Stack } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";

import type { GeometryConfig } from "./index";
import PropertyRow from "../../shared/web/PropertyRow";

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
  config: GeometryConfig;
  onChange: (value: GeometryConfig) => void;
  disabled?: boolean;
}) {
  const [geometries, setGeometries] = useState<Geometry[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetchOptions<Geometry[]>("/api/geometry"),
      fetchOptions<Workspace[]>("/api/workspace"),
    ])
      .then(([geometryItems, workspaceItems]) => {
        if (!cancelled) {
          setGeometries(geometryItems);
          setWorkspaces(workspaceItems);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setGeometries([]);
          setWorkspaces([]);
          setError(
            cause instanceof Error ? cause.message : "Unable to load options",
          );
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
      <PropertyRow label="Geometry">
        <Select
          w="100%"
          size="xs"
          searchable
          placeholder="Select"
          data={geometryOptions}
          value={config.geometryId == null ? null : String(config.geometryId)}
          disabled={disabled}
          error={
            error || (config.geometryId == null ? "Select a geometry" : undefined)
          }
          success={!error && config.geometryId != null}
          onChange={(value) =>
            onChange({
              ...config,
              geometryId: value ? Number(value) : null,
              workspaceId: null,
            })
          }
        />
      </PropertyRow>
      <PropertyRow label="Workspace">
        <Select
          w="100%"
          size="xs"
          searchable
          clearable
          placeholder="No workspace"
          data={workspaceOptions}
          value={
            config.workspaceId == null ? null : String(config.workspaceId)
          }
          disabled={disabled || config.geometryId == null}
          error={error || undefined}
          success={!error && config.geometryId != null}
          onChange={(value) =>
            onChange({
              ...config,
              workspaceId: value ? Number(value) : null,
            })
          }
        />
      </PropertyRow>
      <PropertyRow label="Event">
        <Select
          w="100%"
          size="xs"
          allowDeselect={false}
          data={[
            { value: "down", label: "Down" },
            { value: "up", label: "Up" },
          ]}
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
