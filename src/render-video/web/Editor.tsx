import {
  FileInput,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { useState } from "react";

import type { VideoConfig } from "./index";

type Props = {
  config: VideoConfig;
  onChange: (value: VideoConfig) => void;
  disabled?: boolean;
  targetType?: "key" | "background" | "space";
};

export default function Editor({
  config,
  onChange,
  disabled = false,
  targetType,
}: Props) {
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
        success={Boolean(config.media) && !error}
        onChange={(file) => void upload(file)}
      />
      {config.media && (
        <Text size="xs" c="dimmed" truncate>
          {config.name || config.media}
        </Text>
      )}
      {targetType === "key" && (
        <Switch
          label="Allow overflow outside the key"
          description="Keeps the video centered without clipping it to the key."
          checked={config.unconstrained ?? false}
          disabled={disabled}
          onChange={(event) =>
            set("unconstrained", event.currentTarget.checked)
          }
        />
      )}
    </Stack>
  );
}
