import type { LabelConfig } from "./index";
import { Fragment, useEffect, useId, useState } from "react";
import { fontSizeValue } from "../../shared/web/fontSize";
import { anchorParts } from "../../shared/web/ux/AnchorGrid";
import { offsetIn } from "../../shared/web/geometry";

const fontLoads = new Map<string, Promise<FontFace>>();

function loadFont(filename: string, family: string) {
  let request = fontLoads.get(filename);
  if (!request) {
    const url = `/api/fonts/${encodeURIComponent(filename)}`;
    request = new FontFace(family, `url("${url}")`).load();
    fontLoads.set(filename, request);
  }
  return request;
}

export default function Renderer({
  config,
  x,
  y,
  width,
  height,
}: {
  config: LabelConfig;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const filename = config.font ?? "Inter_18pt-Regular.ttf";
  const family = `KBRD-${filename.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const [loadedFont, setLoadedFont] = useState("");
  const clipId = `kbrd-label-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    let cancelled = false;
    void loadFont(filename, family)
      .then((face) => {
        document.fonts.add(face);
        if (!cancelled) setLoadedFont(filename);
      })
      .catch(() => {
        if (!cancelled) setLoadedFont("");
      });
    return () => {
      cancelled = true;
    };
  }, [family, filename]);

  // Which point of the text the coordinates address, while precise
  // placement is on (see `AnchorGrid`).
  const anchor = anchorParts(config.anchor);
  const px =
    config.precisePlacement
      ? x + offsetIn(config.positionUnit, config.x, width)
      : config.horizontalPosition === "left"
      ? x + 2
      : config.horizontalPosition === "right"
        ? x + width - 2
        : x + width / 2;
  const py =
    config.precisePlacement
      ? y + offsetIn(config.positionUnit, config.y, height)
      : config.verticalPosition === "top"
      ? y + 2
      : config.verticalPosition === "bottom"
        ? y + height - 2
        : y + height / 2;
  return (
    <Fragment>
      {config.precisePlacement && (
        <defs>
          <clipPath id={clipId}>
            <rect x={x} y={y} width={width} height={height} />
          </clipPath>
        </defs>
      )}
      <text
      x={px}
      y={py}
      fill={config.color}
      fontSize={fontSizeValue(config.size)}
      fontFamily={loadedFont === filename ? family : "KBRD Inter"}
      // The label's own font is a single face loaded by filename, with no
      // bold or italic sibling registered alongside it — so these two lean
      // on the browser's synthetic weight and slant rather than on a
      // second file. Left off entirely when unset, so an unstyled label
      // renders exactly as it did before these fields existed.
      fontWeight={config.bold ? "bold" : undefined}
      fontStyle={config.italic ? "italic" : undefined}
      textDecoration={config.underline ? "underline" : undefined}
      textAnchor={
        // Precise placement measures x/y from the cell's own top-left
        // corner; the anchor says which point of the text lands on them.
        config.precisePlacement
          ? anchor.horizontal === "left"
            ? "start"
            : anchor.horizontal === "right"
              ? "end"
              : "middle"
          : config.horizontalPosition === "left"
          ? "start"
          : config.horizontalPosition === "right"
            ? "end"
            : "middle"
      }
      dominantBaseline={
        config.precisePlacement
          ? anchor.vertical === "top"
            ? "hanging"
            : anchor.vertical === "bottom"
              ? "text-after-edge"
              : "central"
          : config.verticalPosition === "top"
          ? "text-before-edge"
          : config.verticalPosition === "bottom"
            ? "text-after-edge"
            : "central"
      }
      clipPath={config.precisePlacement ? `url(#${clipId})` : undefined}
    >
      {config.text}
      </text>
    </Fragment>
  );
}
