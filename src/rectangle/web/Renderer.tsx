import type { RectangleConfig } from "./index";

export default function Renderer({
  config,
  x,
  y,
  width,
  height,
}: {
  config: RectangleConfig;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const rectangleWidth = width * Math.max(0.05, config.width / 100);
  const rectangleHeight = height * Math.max(0.05, config.height / 100);
  const preciseX = Math.max(0, Math.min(100, config.x ?? 50)) / 100;
  const preciseY = Math.max(0, Math.min(100, config.y ?? 50)) / 100;
  const rectangleX =
    config.precisePlacement
      ? x + (width - rectangleWidth) * preciseX
      : config.horizontalPosition === "left"
      ? x
      : config.horizontalPosition === "right"
        ? x + width - rectangleWidth
        : x + (width - rectangleWidth) / 2;
  const rectangleY =
    config.precisePlacement
      ? y + (height - rectangleHeight) * preciseY
      : config.verticalPosition === "top"
      ? y
      : config.verticalPosition === "bottom"
        ? y + height - rectangleHeight
        : y + (height - rectangleHeight) / 2;

  return (
    <rect
      x={rectangleX}
      y={rectangleY}
      width={rectangleWidth}
      height={rectangleHeight}
      fill={config.color ?? "#ffffff"}
    />
  );
}
