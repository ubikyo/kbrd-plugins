import type { RectangleConfig } from "./index";
import { anchoredCorner, offsetIn, sizeIn } from "../../shared/web/geometry";
import { DEFAULT_ANCHOR } from "../../shared/web/blocks/Position";
import { BORDER_DASHES } from "../../shared/web/ux/Border";

// What a rectangle is filled with when it has neither a Background group
// nor the `color` that block replaced.
const DEFAULT_FILL = "#ffffff";

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
  // Its own size first: everything else is measured against it.
  const rectangleWidth = sizeIn(config.dimensionUnit, config.width, width);
  const rectangleHeight = sizeIn(config.dimensionUnit, config.height, height);

  // Precise placement puts a coordinate on the cell and hangs whichever of
  // the rectangle's nine points the anchor names on it — the same pair of
  // rules the label follows, so both read a `%`/`mm` position alike.
  // Without it, the Layout editor's own nine-way grid aligns the
  // rectangle inside the cell, flush with the edge it names.
  const corner = config.precisePlacement
    ? anchoredCorner(
        config.anchor ?? DEFAULT_ANCHOR,
        x + offsetIn(config.positionUnit, config.x, width),
        y + offsetIn(config.positionUnit, config.y, height),
        rectangleWidth,
        rectangleHeight,
      )
    : {
        x:
          config.horizontalPosition === "left"
            ? x
            : config.horizontalPosition === "right"
              ? x + width - rectangleWidth
              : x + (width - rectangleWidth) / 2,
        y:
          config.verticalPosition === "top"
            ? y
            : config.verticalPosition === "bottom"
              ? y + height - rectangleHeight
              : y + (height - rectangleHeight) / 2,
      };

  // `color` is what the fill was called before the Background block — an
  // instance saved back then still renders what it was given.
  const fill = config.backgroundColor ?? config.color ?? DEFAULT_FILL;

  return (
    <rect
      x={corner.x}
      y={corner.y}
      width={rectangleWidth}
      height={rectangleHeight}
      fill={fill}
      stroke={config.borderEnabled ? config.borderColor : undefined}
      // A border's width and dashes are pixels on screen rather than
      // millimetres of glass — the same bargain the grid's own cell
      // outlines make, and what `non-scaling-stroke` is for.
      strokeWidth={config.borderEnabled ? config.borderWidth : undefined}
      strokeDasharray={
        config.borderEnabled ? BORDER_DASHES[config.borderStyle] : undefined
      }
      vectorEffect="non-scaling-stroke"
    />
  );
}
