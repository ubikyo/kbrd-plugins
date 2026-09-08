import BackgroundBlock from "../../shared/web/blocks/Background";
import BorderBlock from "../../shared/web/blocks/Border";

import type { RenderKeyConfig } from "./index";

type Props = {
  // Already merged over the plugin's `defaultConfig` by the host, so every
  // field below has a value to show even when the state stores none.
  config: RenderKeyConfig;
  // What the state actually stores — the difference between "set to the
  // default value" and "not set", which is what a property group's own
  // open/closed state means. See `PluginEditorProps` in kbrd-web.
  definedConfig?: Partial<RenderKeyConfig>;
  onChange: (value: Partial<RenderKeyConfig>) => void;
  disabled?: boolean;
};

/**
 * The Key/Space/Layer element's own look for the active state — the two
 * shared blocks (see `shared/web/blocks`) that say how a shape is filled
 * and how it's outlined, and nothing else: this plugin *is* the element's
 * form, so those two are the whole of it.
 *
 * Both are genuinely optional, and `PropertyGroup`'s own `+`/`×` is what
 * adds or removes each one from the state's config — there's no separate
 * "enabled" switch backing either.
 *
 * This plugin is `deletable: false` in its manifest (see `plugin.json`):
 * it isn't something a user attaches to an element, it's the element's
 * own form, so it never appears in the Plugins tab's draggable list and
 * its row in Properties has no delete button. Being last in that list, it
 * is also the one thing every attached plugin draws on top of (see
 * `LayoutCell` in kbrd-web).
 */
export default function MappingEditor({
  config,
  definedConfig,
  onChange,
  disabled = false,
}: Props) {
  // Every write is built from what's *stored*, never from the merged view:
  // editing one field must not quietly freeze every other one's default
  // into the config, and closing a group must genuinely delete its fields
  // — that deletion is what hands the property back to the manifest's own
  // `defaultConfig`.
  const stored: Partial<RenderKeyConfig> = definedConfig ?? config;

  return (
    <>
      <BackgroundBlock
        config={config}
        stored={stored}
        onChange={onChange}
        disabled={disabled}
      />
      <BorderBlock
        config={config}
        stored={stored}
        onChange={onChange}
        disabled={disabled}
      />
    </>
  );
}
