export { default as Editor } from "./Editor";
export { default as Renderer } from "../../shared/web/ActionRenderer";
export { default as manifest } from "../plugin.json";

export type ApplicationConfig = {
  applicationId: string | null;
  quitOnLongPress: boolean;
};
