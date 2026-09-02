import { FileInput, Slider, Stack, Switch, Text } from "@mantine/core";
import { useState } from "react";

import type { ImageConfig } from "./index";
import PropertyRow from "../../shared/web/PropertyRow";

type Props = {
  config: ImageConfig;
  onChange: (value: ImageConfig) => void;
  disabled?: boolean;
};

const sizeMarks = [
  { value: 25, label: "xs" },
  { value: 50, label: "sm" },
  { value: 75, label: "md" },
  { value: 100, label: "lg" },
  { value: 125, label: "xl" },
];

export default function MappingEditor({ config, onChange, disabled = false }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof ImageConfig>(key: K, value: ImageConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  async function upload(file: File | null) {
    if (!file) {
      onChange({ ...config, media: "", name: "" });
      return;
    }
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/media", { method: "POST", body });
      const result = (await response.json().catch(() => null)) as
        | { filename?: string; error?: string }
        | null;
      if (!response.ok || !result?.filename) {
        throw new Error(result?.error ?? `HTTP ${response.status}`);
      }
      onChange({ ...config, media: result.filename, name: file.name });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Stack gap="md">
      <PropertyRow label="Image">
        <Stack gap={4}>
          <FileInput
            w="100%"
            aria-label="Image"
            placeholder={config.media || "Choose an image"}
            accept="image/png,image/jpeg,image/gif"
            clearable={Boolean(config.media)}
            disabled={disabled || uploading}
            error={error || undefined}
            success={Boolean(config.media) && !error}
            onChange={(file) => void upload(file)}
          />
          {config.media && (
            <Text size="xs" c="dimmed" truncate>
              {config.name || config.media}
            </Text>
          )}
        </Stack>
      </PropertyRow>
      <PropertyRow label="Fill the entire element" align="center" compactControl>
        <Switch
          aria-label="Fill the entire element"
          checked={config.fullSize}
          disabled={disabled}
          onChange={(event) => set("fullSize", event.currentTarget.checked)}
        />
      </PropertyRow>
      {!config.fullSize && (
        <PropertyRow label="Size" align="top">
          <Slider
            w="100%"
            min={10}
            max={150}
            step={5}
            marks={sizeMarks}
            value={config.size}
            disabled={disabled}
            onChange={(value) => set("size", value)}
          />
        </PropertyRow>
      )}
    </Stack>
  );
}
