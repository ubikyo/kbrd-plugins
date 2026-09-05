import { Select, Stack } from "@mantine/core";
import { useEffect, useState } from "react";

import type { LayerConfig } from "./index";
import PropertyRow from "../../shared/web/PropertyRow";

type Option = { value: string; label: string };
type Layout = { id: number; name: string };
type Layer = { id: number; layout_id: number; name: string };

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

export default function MappingEditor({
  config,
  onChange,
  disabled = false,
}: {
  config: LayerConfig;
  onChange: (value: LayerConfig) => void;
  disabled?: boolean;
}) {
  const [options, setOptions] = useState<Option[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetchOptions<Layout[]>("/api/layout"),
      fetchOptions<Layer[]>("/api/layer"),
    ]).then(([layouts, layers]) => {
      if (cancelled) return;
      const names = new Map(layouts.map((item) => [item.id, item.name]));
      setOptions(
        layers.map((item) => ({
          value: String(item.id),
          label: `${names.get(item.layout_id) ?? "Layout"} / ${item.name}`,
        })),
      );
      setError(null);
    }).catch((cause: unknown) => {
      if (!cancelled) {
        setOptions([]);
        setError(
          cause instanceof Error ? cause.message : "Unable to load layers",
        );
      }
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <Stack gap="md">
      <PropertyRow label="Layer">
        <Select
          w="100%"
          size="xs"
          searchable
          placeholder="Select"
          data={options}
          value={config.layerId == null ? null : String(config.layerId)}
          disabled={disabled}
          error={
            error ||
            (config.layerId == null ? "Select a layer" : undefined)
          }
          success={!error && config.layerId != null}
          onChange={(value) =>
            onChange({ ...config, layerId: value ? Number(value) : null })
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
