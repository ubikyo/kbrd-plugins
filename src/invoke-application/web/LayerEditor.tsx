import Action from "./Action";
import type { ApplicationConfig } from "./index";

type Props = {
  // Already merged over the plugin's `defaultConfig` by the host, so every
  // field below has a value to show even when the instance stores none.
  config: ApplicationConfig;
  // What the instance actually stores — the difference between "set to the
  // default value" and "not set", which is what a property group's own
  // open/closed state means. See `PluginEditorProps` in kbrd-web.
  definedConfig?: Partial<ApplicationConfig>;
  onChange: (value: Partial<ApplicationConfig>) => void;
  disabled?: boolean;
};

/**
 * Launching an application is one thing, so this editor is the one block
 * that says it — see `Action` for what it holds and why it lives here
 * rather than in `shared/web/blocks`.
 *
 * One instance is one step: a key takes as many Invoke plugins as it's
 * given, duplicates of the same kind included, and they run top to bottom
 * in the order the Properties list shows them (each instance's own
 * `position`, reorderable by its grip). So this editor never speaks for
 * the key as a whole — only for the one step it belongs to.
 */
export default function LayerEditor({
  config,
  definedConfig,
  onChange,
  disabled = false,
}: Props) {
  // Every write builds on what's stored, not on the merged view — editing
  // one field must not silently set every other one to its default.
  const stored: Partial<ApplicationConfig> = definedConfig ?? config;

  return (
    <Action
      config={config}
      stored={stored}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
