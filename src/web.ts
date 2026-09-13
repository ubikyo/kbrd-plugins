import {
  LayoutEditor as LayoutKeyLayoutEditor,
  LayerEditor as LayoutKeyLayerEditor,
  Renderer as LayoutKeyRenderer,
  manifest as layoutKeyManifest,
} from "./layout-key/web";
import {
  LayoutEditor as LayoutSpaceLayoutEditor,
  LayerEditor as LayoutSpaceLayerEditor,
  Renderer as LayoutSpaceRenderer,
  manifest as layoutSpaceManifest,
} from "./layout-space/web";
import {
  LayoutEditor as RenderKeyLayoutEditor,
  LayerEditor as RenderKeyLayerEditor,
  Renderer as RenderKeyRenderer,
  manifest as renderKeyManifest,
} from "./render-key/web";
import {
  LayoutEditor as LabelLayoutEditor,
  LayerEditor as LabelLayerEditor,
  Renderer as LabelRenderer,
  manifest as labelManifest,
} from "./render-label/web";
import {
  LayoutEditor as KeySymbolLayoutEditor,
  LayerEditor as KeySymbolLayerEditor,
  Renderer as KeySymbolRenderer,
  manifest as keySymbolManifest,
} from "./render-key-symbol/web";
import {
  LayoutEditor as ImageLayoutEditor,
  LayerEditor as ImageLayerEditor,
  Renderer as ImageRenderer,
  manifest as imageManifest,
} from "./render-image/web";
import {
  LayoutEditor as VideoLayoutEditor,
  LayerEditor as VideoLayerEditor,
  Renderer as VideoRenderer,
  manifest as videoManifest,
} from "./render-video/web";
import {
  LayoutEditor as RectangleLayoutEditor,
  LayerEditor as RectangleLayerEditor,
  Renderer as RectangleRenderer,
  manifest as rectangleManifest,
} from "./render-rectangle/web";
import {
  LayoutEditor as LayerLayoutEditor,
  LayerEditor as LayerLayerEditor,
  Renderer as LayerRenderer,
  manifest as layerManifest,
} from "./invoke-layer/web";
import {
  LayoutEditor as LayoutLayoutEditor,
  LayerEditor as LayoutLayerEditor,
  Renderer as LayoutRenderer,
  manifest as layoutManifest,
} from "./invoke-layout/web";
import {
  LayoutEditor as KeystrokeLayoutEditor,
  LayerEditor as KeystrokeLayerEditor,
  Renderer as KeystrokeRenderer,
  manifest as keystrokeManifest,
} from "./invoke-keystroke/web";
import {
  LayoutEditor as DelayLayoutEditor,
  LayerEditor as DelayLayerEditor,
  Renderer as DelayRenderer,
  manifest as delayManifest,
} from "./invoke-delay/web";
import {
  LayoutEditor as ApplicationLayoutEditor,
  LayerEditor as ApplicationLayerEditor,
  Renderer as ApplicationRenderer,
  manifest as applicationManifest,
} from "./invoke-application/web";
import {
  LayoutEditor as WebsiteLayoutEditor,
  LayerEditor as WebsiteLayerEditor,
  Renderer as WebsiteRenderer,
  manifest as websiteManifest,
} from "./invoke-website/web";

export { default as PropertyRow } from "./shared/web/PropertyRow";
export { default as Color } from "./shared/web/ux/Color";
export { default as Border } from "./shared/web/ux/Border";
export { BORDER_DASHES } from "./shared/web/ux/Border";
export type { BorderStyleValue, BorderValue } from "./shared/web/ux/Border";
export { default as PropertyGroup } from "./shared/web/ux/PropertyGroup";
export { default as NumberField } from "./shared/web/ux/NumberField";
export { default as TextField } from "./shared/web/ux/TextField";
export { default as IconToggle, ICON_SIZE } from "./shared/web/ux/IconToggle";
export {
  default as UnitSelect,
  DEFAULT_UNIT,
  UNIT_MAX,
  UNIT_ORIGIN,
} from "./shared/web/ux/UnitSelect";
export type { Unit } from "./shared/web/ux/UnitSelect";
export { default as AnchorGrid } from "./shared/web/ux/AnchorGrid";
export {
  ANCHOR_FACTORS,
  anchorParts,
} from "./shared/web/ux/AnchorGrid";
export type {
  AnchorValue,
  AnchorVertical,
  AnchorHorizontal,
} from "./shared/web/ux/AnchorGrid";

// The property blocks a plugin's Layer editor is composed of — one
// addable/removable group each, over whichever slice of the config it
// owns. See `shared/web/blocks/block.ts`.
export type { BlockProps } from "./shared/web/blocks/block";
export { default as PositionBlock } from "./shared/web/blocks/Position";
export {
  DEFAULT_ANCHOR,
  POSITION_KEYS,
} from "./shared/web/blocks/Position";
export type { PositionConfig } from "./shared/web/blocks/Position";
export { default as DimensionBlock } from "./shared/web/blocks/Dimension";
export { DIMENSION_KEYS } from "./shared/web/blocks/Dimension";
export type { DimensionConfig } from "./shared/web/blocks/Dimension";
export { default as TypographyBlock } from "./shared/web/blocks/Typography";
export { TYPOGRAPHY_KEYS } from "./shared/web/blocks/Typography";
export type { TypographyConfig } from "./shared/web/blocks/Typography";
export { default as BackgroundBlock } from "./shared/web/blocks/Background";
export {
  BACKGROUND_KEYS,
  DEFAULT_BACKGROUND_COLOR,
} from "./shared/web/blocks/Background";
export type { BackgroundConfig } from "./shared/web/blocks/Background";
export { default as BorderBlock } from "./shared/web/blocks/Border";
export { BORDER_KEYS } from "./shared/web/blocks/Border";
export type { BorderConfig } from "./shared/web/blocks/Border";

export const plugins = [
  {
    ...layoutKeyManifest,
    LayoutEditor: LayoutKeyLayoutEditor,
    LayerEditor: LayoutKeyLayerEditor,
    Renderer: LayoutKeyRenderer,
  },
  {
    ...layoutSpaceManifest,
    LayoutEditor: LayoutSpaceLayoutEditor,
    LayerEditor: LayoutSpaceLayerEditor,
    Renderer: LayoutSpaceRenderer,
  },
  {
    ...renderKeyManifest,
    LayoutEditor: RenderKeyLayoutEditor,
    LayerEditor: RenderKeyLayerEditor,
    Renderer: RenderKeyRenderer,
  },
  {
    ...labelManifest,
    LayoutEditor: LabelLayoutEditor,
    LayerEditor: LabelLayerEditor,
    Renderer: LabelRenderer,
  },
  {
    ...keySymbolManifest,
    LayoutEditor: KeySymbolLayoutEditor,
    LayerEditor: KeySymbolLayerEditor,
    Renderer: KeySymbolRenderer,
  },
  {
    ...imageManifest,
    LayoutEditor: ImageLayoutEditor,
    LayerEditor: ImageLayerEditor,
    Renderer: ImageRenderer,
  },
  {
    ...videoManifest,
    LayoutEditor: VideoLayoutEditor,
    LayerEditor: VideoLayerEditor,
    Renderer: VideoRenderer,
  },
  {
    ...rectangleManifest,
    LayoutEditor: RectangleLayoutEditor,
    LayerEditor: RectangleLayerEditor,
    Renderer: RectangleRenderer,
  },
  {
    ...layerManifest,
    LayoutEditor: LayerLayoutEditor,
    LayerEditor: LayerLayerEditor,
    Renderer: LayerRenderer,
  },
  {
    ...layoutManifest,
    LayoutEditor: LayoutLayoutEditor,
    LayerEditor: LayoutLayerEditor,
    Renderer: LayoutRenderer,
  },
  {
    ...keystrokeManifest,
    LayoutEditor: KeystrokeLayoutEditor,
    LayerEditor: KeystrokeLayerEditor,
    Renderer: KeystrokeRenderer,
  },
  {
    ...delayManifest,
    LayoutEditor: DelayLayoutEditor,
    LayerEditor: DelayLayerEditor,
    Renderer: DelayRenderer,
  },
  {
    ...applicationManifest,
    LayoutEditor: ApplicationLayoutEditor,
    LayerEditor: ApplicationLayerEditor,
    Renderer: ApplicationRenderer,
  },
  {
    ...websiteManifest,
    LayoutEditor: WebsiteLayoutEditor,
    LayerEditor: WebsiteLayerEditor,
    Renderer: WebsiteRenderer,
  },
];
