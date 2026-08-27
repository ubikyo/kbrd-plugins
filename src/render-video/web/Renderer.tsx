import { useRef } from "react";

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
  const completedPlays = useRef(0);
  if (!config.media) return null;

  const playCount = Math.max(1, Math.floor(config.playCount ?? 1));
  const ratio = config.fullSize ? 1 : Math.max(0.1, config.size / 100);
  const videoWidth = width * ratio;
  const videoHeight = height * ratio;
  const preciseX = Math.max(0, Math.min(100, config.x ?? 50)) / 100;
  const preciseY = Math.max(0, Math.min(100, config.y ?? 50)) / 100;
  const videoX = !config.fullSize && config.precisePlacement
    ? x + (width - videoWidth) * preciseX
    : config.horizontalPosition === "left"
      ? x
      : config.horizontalPosition === "right"
        ? x + width - videoWidth
        : x + (width - videoWidth) / 2;
  const videoY = !config.fullSize && config.precisePlacement
    ? y + (height - videoHeight) * preciseY
    : config.verticalPosition === "top"
      ? y
      : config.verticalPosition === "bottom"
        ? y + height - videoHeight
        : y + (height - videoHeight) / 2;

  return (
    <foreignObject
      x={videoX}
      y={videoY}
      width={videoWidth}
      height={videoHeight}
      pointerEvents="none"
    >
      <video
        key={`${config.media}-${config.loop}-${playCount}`}
        src={`/api/media/${encodeURIComponent(config.media)}`}
        autoPlay
        muted
        playsInline
        loop={config.loop ?? false}
        preload="auto"
        onLoadedData={() => {
          completedPlays.current = 0;
        }}
        onEnded={(event) => {
          completedPlays.current += 1;
          if (!config.loop && completedPlays.current < playCount) {
            event.currentTarget.currentTime = 0;
            void event.currentTarget.play();
          }
        }}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: config.fit === "cover" ? "cover" : "contain",
        }}
      />
    </foreignObject>
  );
}
