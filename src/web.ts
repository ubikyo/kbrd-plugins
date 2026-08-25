import {
  Editor as LabelEditor,
  Renderer as LabelRenderer,
  manifest as labelManifest,
} from "./label/web";
import {
  Editor as ImageEditor,
  Renderer as ImageRenderer,
  manifest as imageManifest,
} from "./image/web";
import {
  Editor as RectangleEditor,
  Renderer as RectangleRenderer,
  manifest as rectangleManifest,
} from "./rectangle/web";
import {
  Editor as SetWorkspaceEditor,
  Renderer as SetWorkspaceRenderer,
  manifest as setWorkspaceManifest,
} from "./set-workspace/web";
import {
  Editor as SetGeometryEditor,
  Renderer as SetGeometryRenderer,
  manifest as setGeometryManifest,
} from "./set-geometry/web";

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
    ...setWorkspaceManifest,
    Editor: SetWorkspaceEditor,
    Renderer: SetWorkspaceRenderer,
  },
  {
    ...setGeometryManifest,
    Editor: SetGeometryEditor,
    Renderer: SetGeometryRenderer,
  },
];
