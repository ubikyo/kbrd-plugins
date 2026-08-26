import {
  Editor as LabelEditor,
  Renderer as LabelRenderer,
  manifest as labelManifest,
} from "./render-label/web";
import {
  Editor as ImageEditor,
  Renderer as ImageRenderer,
  manifest as imageManifest,
} from "./render-image/web";
import {
  Editor as RectangleEditor,
  Renderer as RectangleRenderer,
  manifest as rectangleManifest,
} from "./render-rectangle/web";
import {
  Editor as WorkspaceEditor,
  Renderer as WorkspaceRenderer,
  manifest as workspaceManifest,
} from "./invoke-workspace/web";
import {
  Editor as GeometryEditor,
  Renderer as GeometryRenderer,
  manifest as geometryManifest,
} from "./invoke-geometry/web";
import {
  Editor as KeystrokeEditor,
  Renderer as KeystrokeRenderer,
  manifest as keystrokeManifest,
} from "./invoke-keystroke/web";

export const plugins = [
  {
    ...labelManifest,
    Editor: LabelEditor,
    Renderer: LabelRenderer,
  },
  {
    ...imageManifest,
    Editor: ImageEditor,
    Renderer: ImageRenderer,
  },
  {
    ...rectangleManifest,
    Editor: RectangleEditor,
    Renderer: RectangleRenderer,
  },
  {
    ...workspaceManifest,
    Editor: WorkspaceEditor,
    Renderer: WorkspaceRenderer,
  },
  {
    ...geometryManifest,
    Editor: GeometryEditor,
    Renderer: GeometryRenderer,
  },
  {
    ...keystrokeManifest,
    Editor: KeystrokeEditor,
    Renderer: KeystrokeRenderer,
  },
];
