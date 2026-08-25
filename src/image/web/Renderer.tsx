import type { ImageConfig } from "./index";

export default function Renderer({
  config,
  x,
  y,
  width,
  height,
}: {
  config: ImageConfig;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  if (!config.media) return null;
  const ratio = config.fullSize ? 1 : Math.max(0.1, config.size / 100);
  const imageWidth = width * ratio;
  const imageHeight = height * ratio;
  const preciseX = Math.max(0, Math.min(100, config.x ?? 50)) / 100;
  const preciseY = Math.max(0, Math.min(100, config.y ?? 50)) / 100;
  const imageX = !config.fullSize && config.precisePlacement
    ? x + (width - imageWidth) * preciseX
    : config.horizontalPosition === "left"
      ? x
      : config.horizontalPosition === "right"
        ? x + width - imageWidth
        : x + (width - imageWidth) / 2;
  const imageY = !config.fullSize && config.precisePlacement
    ? y + (height - imageHeight) * preciseY
    : config.verticalPosition === "top"
      ? y
      : config.verticalPosition === "bottom"
        ? y + height - imageHeight
        : y + (height - imageHeight) / 2;

  return (
    <image
      href={`/api/medias/${encodeURIComponent(config.media)}`}
      x={imageX}
      y={imageY}
      width={imageWidth}
      height={imageHeight}
      preserveAspectRatio="xMidYMid meet"
    />
  );
}
