export { default as Editor } from "./Editor";
export { default as Renderer } from "../../shared/web/ActionRenderer";
export { default as manifest } from "../plugin.json";

export type SetWorkspaceConfig = {
  workspaceId: number | null;
  event: "down" | "up";
};
