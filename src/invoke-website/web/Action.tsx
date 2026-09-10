import { Select, Stack } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";

import type { BlockProps } from "../../shared/web/blocks/block";
import { useLeadSection } from "../../shared/web/ux/lead";
import PropertyGroup from "../../shared/web/ux/PropertyGroup";
import TextField from "../../shared/web/ux/TextField";
import type { WebsiteConfig } from "./index";

type Option = { value: string; label: string };
type Browser = {
  id: string;
  name: string;
  // Whether this is the one the Mac itself opens a link with — the
  // agent's own answer, not a guess from the list's order (see
  // `isWebBrowser`/`defaultBrowserID` in kbrd-agent).
  isDefault: boolean;
};

// The white marker leading the browser field — the same gesture
// Typography makes with "Text" (see `leadSection`), rather than a label
// of its own outside the field. Handed to `useLeadSection`, which both
// draws it and measures the room the value needs to clear it.
const BROWSER_LEAD = "Use this browser";

/** The fields this block owns — everything the group's `×` takes away
 * again, exactly as a shared block states its own (see
 * `blocks/Position`'s `POSITION_KEYS`). */
export const ACTION_KEYS = ["url", "browserId"] as const;

// One request for the whole app, shared by every instance of this editor:
// the installed browsers are the same list for all of them, and opening a
// second panel must not ask the agent for it again. The same bargain
// `invoke-application`'s `Action` makes with `/api/applications`,
// rejections included — a failure is dropped rather than cached, so a
// mount after the agent comes back retries instead of inheriting the old
// error.
let browsersRequest: Promise<Browser[]> | undefined;

function loadBrowsers() {
  browsersRequest ??= fetch("/api/browsers")
    .then(async (response) => {
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error || "Unable to load browsers");
      }
      return (await response.json()) as Browser[];
    })
    .catch((cause: unknown) => {
      browsersRequest = undefined;
      throw cause;
    });
  return browsersRequest;
}

/**
 * What this plugin does when the key it's attached to is used: which
 * address to open, and which browser opens it.
 *
 * Website's own, not a shared block: every Invoke plugin has an action,
 * but no two are the same one (a layer to switch to, an application to
 * raise, a page to open), so there is nothing here for a second plugin to
 * reuse beyond the group itself — see `invoke-application`'s own `Action`
 * for the same reasoning.
 *
 * An *optional* group, like every block in `shared/web/blocks`: a key
 * carries as many actions as it's given — several of the same kind
 * included, each one its own instance, run top to bottom in the order the
 * Properties list shows them — so no single instance is the key's one
 * behaviour, and an instance with its group closed is simply a step that
 * says nothing for the state being edited (its fields come back from the
 * manifest's `defaultConfig`, i.e. no address, no browser). Detaching the
 * instance in the Properties list is still what removes the step itself.
 */
export default function Action({
  config,
  stored,
  onChange,
  disabled = false,
}: BlockProps<WebsiteConfig>) {
  const [browsers, setBrowsers] = useState<Browser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadBrowsers()
      .then((items) => {
        if (!cancelled) {
          setBrowsers(items);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setBrowsers([]);
          setError(
            cause instanceof Error ? cause.message : "Unable to load browsers",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const options: Option[] = useMemo(
    () => browsers.map(({ id, name }) => ({ value: id, label: name })),
    [browsers],
  );

  const browserLead = useLeadSection(BROWSER_LEAD);

  // What a fresh group opens the page with: whichever browser the machine
  // itself would use. Unlike the first entry of an alphabetical list,
  // that *is* an answer worth putting in the config on the user's behalf
  // — it's the one the link would have opened in anyway. `null` only
  // while the list is still on its way (or has nothing in it) — the
  // effect below finishes the job when it lands.
  const defaultBrowser = browsers.find((item) => item.isDefault) ?? null;

  // Every write builds on what's stored, never on the merged view — see
  // `BlockProps`: picking a browser must not also freeze today's default
  // address into the state's own config.
  const write = (patch: Partial<WebsiteConfig>) =>
    onChange({ ...stored, ...patch });

  function remove() {
    const remaining: Partial<WebsiteConfig> = { ...stored };
    for (const key of ACTION_KEYS) delete remaining[key];
    onChange(remaining);
  }

  // `url` is the field the action is actually *about*, so its presence is
  // the group's — a browser alone would leave a group that says nothing.
  // The empty string counts as stored (that's "no address typed yet",
  // which the field shows as an empty line under its marker); only
  // `undefined` is "not set at all".
  const active = stored.url !== undefined;

  // The list arrives after the panel does, so a group added before the
  // fetch came back has no default to take yet. Fill it in as soon as
  // there is one rather than leaving the group sitting on its
  // placeholder — only while the group is open and still says no
  // browser, which is a state nothing else can put it back into (the
  // select can't be deselected).
  useEffect(() => {
    if (!active || config.browserId != null || defaultBrowser == null) return;
    write({ browserId: defaultBrowser.id });
    // `write` closes over what's stored, which is exactly what this reads
    // at the moment it fires; the three values above are the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, config.browserId, defaultBrowser]);

  return (
    <PropertyGroup
      title="Action"
      active={active}
      onAdd={() =>
        write({
          url: config.url ?? "",
          // The machine's own default browser, so the step opens the page
          // the way the machine would. Still `null` if the list hasn't
          // landed yet — the effect above fills it in once it has.
          browserId: config.browserId ?? defaultBrowser?.id ?? null,
        })
      }
      onRemove={remove}
    >
      <Stack gap="xs">
        {/* No placeholder: the marker at the start of the field already
            says what the line is for, and a greyed-out example address
            sitting in it reads as a value that's already there. */}
        <TextField
          aria-label="URL"
          lead="URL"
          value={config.url ?? ""}
          disabled={disabled}
          onChange={(value) => write({ url: value })}
        />
        {/* The marker leads the field itself rather than labelling it
            from outside, exactly as `Typography` leads its own text with
            "Text": the browser's name follows the marker on the one line,
            so the row reads as a sentence instead of a label meeting its
            answer somewhere in the middle. */}
        <Select
          variant="unstyled"
          size="xs"
          w="100%"
          aria-label="Browser"
          placeholder="Select a browser"
          searchable
          leftSection={browserLead.section}
          // Decorative: the field's accessible name is its `aria-label`,
          // and a click on the marker is meant for the field — see
          // `leadSection`.
          leftSectionPointerEvents="none"
          // Whatever went wrong loading the list is said inside the
          // dropdown, where the missing options are — the field itself
          // carries no message of its own: "no browser picked" is what
          // the placeholder already says, and a red line under every
          // fresh step is noise rather than news.
          nothingFoundMessage={error ?? "No browser found"}
          allowDeselect={false}
          data={options}
          value={config.browserId ?? null}
          disabled={disabled}
          onChange={(browserId) => write({ browserId })}
          // The same two corrections every `unstyled` select in these
          // panels needs (see `ux/UnitSelect`): no padding of its own to
          // keep the chevron off the text, and a section that would
          // otherwise be as wide as the field is tall — plus the room the
          // marker itself takes at the start, which an `unstyled` input
          // has none of its own to build on.
          styles={{
            input: {
              paddingInlineStart: browserLead.room,
              paddingInlineEnd: 14,
            },
            section: { width: "auto" },
          }}
        />
      </Stack>
    </PropertyGroup>
  );
}
