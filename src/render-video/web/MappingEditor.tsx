import { FileInput, Stack } from "@mantine/core";
import { useState } from "react";

import type { VideoConfig } from "./index";
import PropertyRow from "../../shared/web/PropertyRow";

type Props = {
  config: VideoConfig;
  onChange: (value: VideoConfig) => void;
  disabled?: boolean;
};

export default function MappingEditor({
  config,
  onChange,
  disabled = false,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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
      <PropertyRow
        label="Video"
        description="MP4/H.264 or transparent WebM/VP9, without audio"
      >
        <Stack gap={4}>
          <FileInput
            w="100%"
            aria-label="Video"
            placeholder={config.name || "Choose a video"}
            accept="video/mp4,video/webm"
            clearable={Boolean(config.media)}
            disabled={disabled || uploading}
            error={error || undefined}
            success={Boolean(config.media) && !error}
            onChange={(file) => void upload(file)}
          />
        </Stack>
      </PropertyRow>
    </Stack>
  );
}
