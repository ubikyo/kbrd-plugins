/**
 * What every property block below takes. A block is one addable/removable
 * group in the Properties tab — its own `PropertyGroup`, its own fields,
 * and its own rules for what "adding" and "removing" it write — over
 * whichever slice of a plugin's config it owns. Plugins compose them
 * rather than each spelling out the same group again (see
 * `render-label`/`render-rectangle`/`render-key`'s own `MappingEditor`s).
 *
 * `T` is the block's own fields; a plugin's config type is the
 * intersection of the ones it uses, so a block stays usable by any plugin
 * that carries its fields.
 */
export type BlockProps<T> = {
  // Already merged over the plugin's `defaultConfig` by the host, so every
  // field a block reads has a value to show even when the instance stores
  // none.
  config: T;
  // Only what the instance actually stores, before those defaults are
  // merged in: the difference between "set to the default value" and "not
  // set at all", which is what a group's own open/closed state means (see
  // `PluginEditorProps` in kbrd-web) — and what every write has to build
  // on, so editing one field never freezes another one's default into the
  // config.
  stored: Partial<T>;
  onChange: (value: Partial<T>) => void;
  disabled?: boolean;
};
