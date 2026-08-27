import { useEffect, useState } from "react";

import type { VideoConfig } from "./index";

export default function Renderer({
  config,
  x,
  y,
  width,
  height,
}: {
  config: VideoConfig;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const [videoRatio, setVideoRatio] = useState<number | null>(null);

  useEffect(() => setVideoRatio(null), [config.media]);

  if (!config.media) return null;

  const unconstrained = config.unconstrained === true;
  const targetRatio = width / height;
  const videoWidth =
    unconstrained && videoRatio && videoRatio > targetRatio
      ? height * videoRatio
      : width;
  const videoHeight =
    unconstrained && videoRatio && videoRatio < targetRatio
      ? width / videoRatio
      : height;
  const videoX = x + (width - videoWidth) / 2;
  const videoY = y + (height - videoHeight) / 2;

  return (
    <foreignObject
      x={videoX}
      y={videoY}
      width={videoWidth}
      height={videoHeight}
      pointerEvents="none"
    >
      <video
        key={config.media}
        src={`/api/media/${encodeURIComponent(config.media)}`}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        onLoadedMetadata={(event) => {
          if (event.currentTarget.videoHeight > 0) {
            setVideoRatio(
              event.currentTarget.videoWidth / event.currentTarget.videoHeight,
            );
          }
        }}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: unconstrained ? "fill" : "cover",
          objectPosition: "center",
        }}
      />
    </foreignObject>
  );
}
