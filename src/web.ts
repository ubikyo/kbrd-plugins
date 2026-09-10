import {
  LayoutEditor as LayoutKeyLayoutEditor,
  MappingEditor as LayoutKeyMappingEditor,
  Renderer as LayoutKeyRenderer,
  manifest as layoutKeyManifest,
} from "./layout-key/web";
import {
  LayoutEditor as LayoutSpaceLayoutEditor,
  MappingEditor as LayoutSpaceMappingEditor,
  Renderer as LayoutSpaceRenderer,
  manifest as layoutSpaceManifest,
} from "./layout-space/web";
import {
  LayoutEditor as RenderKeyLayoutEditor,
  MappingEditor as RenderKeyMappingEditor,
  Renderer as RenderKeyRenderer,
  manifest as renderKeyManifest,
} from "./render-key/web";
import {
  LayoutEditor as LabelLayoutEditor,
  MappingEditor as LabelMappingEditor,
  Renderer as LabelRenderer,
  manifest as labelManifest,
} from "./render-label/web";
import {
  LayoutEditor as KeySymbolLayoutEditor,
  MappingEditor as KeySymbolMappingEditor,
  Renderer as KeySymbolRenderer,
  manifest as keySymbolManifest,
} from "./render-key-symbol/web";
import {
  LayoutEditor as ImageLayoutEditor,
  MappingEditor as ImageMappingEditor,
  Renderer as ImageRenderer,
  manifest as imageManifest,
} from "./render-image/web";
import {
  LayoutEditor as VideoLayoutEditor,
  MappingEditor as VideoMappingEditor,
  Renderer as VideoRenderer,
  manifest as videoManifest,
} from "./render-video/web";
import {
  LayoutEditor as RectangleLayoutEditor,
  MappingEditor as RectangleMappingEditor,
  Renderer as RectangleRenderer,
  manifest as rectangleManifest,
} from "./render-rectangle/web";
import {
  LayoutEditor as LayerLayoutEditor,
  MappingEditor as LayerMappingEditor,
  Renderer as LayerRenderer,
  manifest as layerManifest,
} from "./invoke-layer/web";
import {
  LayoutEditor as LayoutLayoutEditor,
  MappingEditor as LayoutMappingEditor,
  Renderer as LayoutRenderer,
  manifest as layoutManifest,
} from "./invoke-layout/web";
import {
  LayoutEditor as KeystrokeLayoutEditor,
  MappingEditor as KeystrokeMappingEditor,
  Renderer as KeystrokeRenderer,
  manifest as keystrokeManifest,
} from "./invoke-keystroke/web";
import {
  LayoutEditor as DelayLayoutEditor,
  MappingEditor as DelayMappingEditor,
  Renderer as DelayRenderer,
  manifest as delayManifest,
} from "./invoke-delay/web";
import {
  LayoutEditor as ApplicationLayoutEditor,
  MappingEditor as ApplicationMappingEditor,
  Renderer as ApplicationRenderer,
  manifest as applicationManifest,
} from "./invoke-application/web";
import {
  LayoutEditor as WebsiteLayoutEditor,
  MappingEditor as WebsiteMappingEditor,
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

// The property blocks a plugin's Mapping editor is composed of — one
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
    MappingEditor: LayoutKeyMappingEditor,
    Renderer: LayoutKeyRenderer,
  },
  {
    ...layoutSpaceManifest,
    LayoutEditor: LayoutSpaceLayoutEditor,
    MappingEditor: LayoutSpaceMappingEditor,
    Renderer: LayoutSpaceRenderer,
  },
  {
    ...renderKeyManifest,
    LayoutEditor: RenderKeyLayoutEditor,
    MappingEditor: RenderKeyMappingEditor,
    Renderer: RenderKeyRenderer,
  },
  {
    ...labelManifest,
    LayoutEditor: LabelLayoutEditor,
    MappingEditor: LabelMappingEditor,
    Renderer: LabelRenderer,
  },
  {
    ...keySymbolManifest,
    LayoutEditor: KeySymbolLayoutEditor,
    MappingEditor: KeySymbolMappingEditor,
    Renderer: KeySymbolRenderer,
  },
  {
    ...imageManifest,
    LayoutEditor: ImageLayoutEditor,
    MappingEditor: ImageMappingEditor,
    Renderer: ImageRenderer,
  },
  {
    ...videoManifest,
    LayoutEditor: VideoLayoutEditor,
    MappingEditor: VideoMappingEditor,
    Renderer: VideoRenderer,
  },
  {
    ...rectangleManifest,
    LayoutEditor: RectangleLayoutEditor,
    MappingEditor: RectangleMappingEditor,
    Renderer: RectangleRenderer,
  },
  {
    ...layerManifest,
    LayoutEditor: LayerLayoutEditor,
    MappingEditor: LayerMappingEditor,
    Renderer: LayerRenderer,
  },
  {
    ...layoutManifest,
    LayoutEditor: LayoutLayoutEditor,
    MappingEditor: LayoutMappingEditor,
    Renderer: LayoutRenderer,
  },
  {
    ...keystrokeManifest,
    LayoutEditor: KeystrokeLayoutEditor,
    MappingEditor: KeystrokeMappingEditor,
    Renderer: KeystrokeRenderer,
  },
  {
    ...delayManifest,
    LayoutEditor: DelayLayoutEditor,
    MappingEditor: DelayMappingEditor,
    Renderer: DelayRenderer,
  },
  {
    ...applicationManifest,
    LayoutEditor: ApplicationLayoutEditor,
    MappingEditor: ApplicationMappingEditor,
    Renderer: ApplicationRenderer,
  },
  {
    ...websiteManifest,
    LayoutEditor: WebsiteLayoutEditor,
    MappingEditor: WebsiteMappingEditor,
    Renderer: WebsiteRenderer,
  },
];
