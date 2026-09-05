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
