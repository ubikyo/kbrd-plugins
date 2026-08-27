import {
  FileInput,
  Group,
  Input,
  NumberInput,
  SegmentedControl,
  Slider,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { useState } from "react";

import type { VideoConfig } from "./index";
import Placement from "../../shared/web/Placement";

type Props = {
  config: VideoConfig;
  onChange: (value: VideoConfig) => void;
  disabled?: boolean;
};

export default function Editor({ config, onChange, disabled = false }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof VideoConfig>(key: K, value: VideoConfig[K]) {
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
      <FileInput
        label="Video"
        description="MP4/H.264 or transparent WebM/VP9, without audio"
        placeholder={config.media || "Choose a video"}
        accept="video/mp4,video/webm"
        clearable={Boolean(config.media)}
        disabled={disabled || uploading}
        error={error || undefined}
        onChange={(file) => void upload(file)}
      />
      {config.media && (
        <Text size="xs" c="dimmed" truncate>
          {config.name || config.media}
        </Text>
      )}
      <Input.Wrapper label="Fit">
        <SegmentedControl
          mt="xs"
          fullWidth
          value={config.fit ?? "contain"}
          disabled={disabled}
          onChange={(value) => set("fit", value as VideoConfig["fit"])}
          data={[
            { label: "Contain", value: "contain" },
            { label: "Cover", value: "cover" },
          ]}
        />
      </Input.Wrapper>
      <Switch
        label="Loop"
        checked={config.loop ?? false}
        disabled={disabled}
        onChange={(event) => set("loop", event.currentTarget.checked)}
      />
      {!config.loop && (
        <Group justify="space-between" wrap="nowrap">
          <Text size="sm">Play count</Text>
          <NumberInput
            w={160}
            min={1}
            step={1}
            allowDecimal={false}
            allowNegative={false}
            clampBehavior="strict"
            value={config.playCount ?? 1}
            disabled={disabled}
            onChange={(value) =>
              set("playCount", typeof value === "number" ? value : 1)
            }
          />
        </Group>
      )}
      <Switch
        label="Fill the entire key"
        checked={config.fullSize}
        disabled={disabled}
        onChange={(event) => set("fullSize", event.currentTarget.checked)}
      />
      {!config.fullSize && (
        <Input.Wrapper label="Size" description={`${config.size} %`}>
          <Slider
            mt="xs"
            min={10}
            max={100}
            step={5}
            value={config.size}
            disabled={disabled}
            onChange={(value) => set("size", value)}
          />
        </Input.Wrapper>
      )}
      {!config.fullSize && (
        <Placement config={config} onChange={onChange} disabled={disabled} />
      )}
    </Stack>
  );
}
