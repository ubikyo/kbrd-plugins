import type { LabelConfig } from "./index";
import { Fragment, useEffect, useId, useState } from "react";
import { fontSizeValue } from "../../shared/web/fontSize";
import { resolveRuns, uniformScript } from "../../shared/web/textRuns";
import {
  scriptFontSize,
  scriptOffset,
  transformText,
} from "../../shared/web/typography";
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
  // Casing and script are resolved here rather than handed to CSS: the
  // device's own renderer has neither `text-transform` nor
  // `vertical-align`, and this has to draw what the hardware will. See
  // `shared/web/typography.ts`, whose numbers `dev/renderer.py` shares.
  //
  // All five emphases can apply to a piece of the label rather than all
  // of it, so the string is drawn as the pieces it is made of — see
  // `shared/web/textRuns.ts`.
  const runs = resolveRuns(config.text, config.spans, {
    bold: config.bold ?? false,
    italic: config.italic ?? false,
    underline: config.underline ?? false,
    transform: config.transform ?? "none",
    script: config.script ?? "none",
  });
  const size = fontSizeValue(config.size);
  // The one script the whole label is in, or `null` if it mixes them.
  // A uniform label — which is every label that isn't deliberately an
  // "H₂O" — is drawn exactly as it was before pieces existed: the size
  // and the baseline shift sit on the `<text>` itself, where the
  // baseline the anchor addresses is the shrunken text's own. Only a
  // mixed one moves them onto the pieces.
  const script = uniformScript(runs);
  // SVG's `dy` accumulates: a shift on one `tspan` moves every later one
  // too. So a piece carries the *step* from the piece before it rather
  // than its own height, and a label that comes back down to the
  // baseline says so with a step of its own.
  const shifts = runs.map((run) => scriptOffset(size, run.script));
  const steps = shifts.map((shift, index) => shift - (shifts[index - 1] ?? 0));
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
      fontSize={script === null ? size : scriptFontSize(size, script)}
      // Positive is up, and SVG's y axis grows downwards — hence the
      // sign. Applied as `dy` rather than as part of `py` so the anchor
      // and baseline above keep addressing the text's own position, with
      // the script riding off it.
      dy={script === null ? undefined : -scriptOffset(size, script)}
      fontFamily={loadedFont === filename ? family : "KBRD Inter"}
      // SVG collapses runs of whitespace and trims each drawn chunk
      // unless told otherwise, which would eat the space between two
      // differently emphasised words and, on a label drawn in one piece,
      // any space the user actually typed at either end. Kivy keeps both,
      // so keeping them here is what makes the two agree.
      xmlSpace="preserve"
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
        {runs.map((run, index) => (
          // The label's own font is a single face loaded by filename,
          // with no bold or italic sibling registered alongside it — so
          // these two lean on the browser's synthetic weight and slant
          // rather than on a second file. Left off entirely when unset,
          // so an unstyled label renders exactly as it did before these
          // fields existed.
          //
          // Casing is applied per piece, which is also how the device
          // does it: "capitalize" treats each piece's first word as a
          // word of its own, so capitalising half a word capitalises
          // that half's first letter.
          <tspan
            // Runs have no identity of their own — they're derived from
            // the text and its spans on every render, and the list is
            // rebuilt whole whenever either changes, so position is the
            // only key there is and nothing depends on it surviving.
            key={index}
            fontWeight={run.bold ? "bold" : undefined}
            fontStyle={run.italic ? "italic" : undefined}
            textDecoration={run.underline ? "underline" : undefined}
            // Only on a label that mixes scripts; a uniform one carries
            // both of these on the `<text>` above.
            fontSize={
              script === null ? scriptFontSize(size, run.script) : undefined
            }
            dy={script === null ? -steps[index] : undefined}
          >
            {transformText(run.text, run.transform)}
          </tspan>
        ))}
      </text>
    </Fragment>
  );
}
