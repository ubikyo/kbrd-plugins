import { Select, Stack } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";

import type { LayoutConfig } from "./index";
import PropertyRow from "../../shared/web/PropertyRow";

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
  config: LayoutConfig;
  onChange: (value: LayoutConfig) => void;
  disabled?: boolean;
}) {
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetchOptions<Layout[]>("/api/layout"),
      fetchOptions<Layer[]>("/api/layer"),
    ])
      .then(([layoutItems, layerItems]) => {
        if (!cancelled) {
          setLayouts(layoutItems);
          setLayers(layerItems);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setLayouts([]);
          setLayers([]);
          setError(
            cause instanceof Error ? cause.message : "Unable to load options",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const layoutOptions = useMemo(
    () =>
      layouts.map((item) => ({
        value: String(item.id),
        label: item.name,
      })),
    [layouts],
  );
  const layerOptions = useMemo(
    () =>
      layers
        .filter((item) => item.layout_id === config.layoutId)
        .map((item) => ({ value: String(item.id), label: item.name })),
    [config.layoutId, layers],
  );

  return (
    <Stack gap="md">
      <PropertyRow label="Layout">
        <Select
          w="100%"
          size="xs"
          searchable
          placeholder="Select"
          data={layoutOptions}
          value={config.layoutId == null ? null : String(config.layoutId)}
          disabled={disabled}
          error={
            error || (config.layoutId == null ? "Select a layout" : undefined)
          }
          success={!error && config.layoutId != null}
          onChange={(value) =>
            onChange({
              ...config,
              layoutId: value ? Number(value) : null,
              layerId: null,
            })
          }
        />
      </PropertyRow>
      <PropertyRow label="Layer">
        <Select
          w="100%"
          size="xs"
          searchable
          clearable
          placeholder="No layer"
          data={layerOptions}
          value={
            config.layerId == null ? null : String(config.layerId)
          }
          disabled={disabled || config.layoutId == null}
          error={error || undefined}
          success={!error && config.layoutId != null}
          onChange={(value) =>
            onChange({
              ...config,
              layerId: value ? Number(value) : null,
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
