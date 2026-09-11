import { Select, Stack } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";

import type { BlockProps } from "../../shared/web/blocks/block";
import { useLeadSection } from "../../shared/web/ux/lead";
import PropertyGroup from "../../shared/web/ux/PropertyGroup";
import type { ApplicationConfig } from "./index";

type Option = { value: string; label: string };
type Application = {
  id: string;
  name: string;
  // Whether the agent can be asked to quit this one by bundle identifier
  // — not every application can be, and the long-press answer below has
  // nothing to offer for one that can't.
  canQuit: boolean;
};

/** The fields this block owns — everything the group's `×` takes away
 * again, exactly as a shared block states its own (see
 * `blocks/Position`'s `POSITION_KEYS`). */
export const ACTION_KEYS = ["applicationId", "quitOnLongPress"] as const;

/** What a fresh group answers the long-press question with. Matches the
 * manifest's `defaultConfig`, so adding the group and never touching the
 * control stores the same thing the plugin would have fallen back to. */
export const DEFAULT_QUIT_ON_LONG_PRESS = false;

// Roughly what "Yes" plus a chevron takes at the `xs` these fields all
// use: three characters at `lead.tsx`'s own 6.5px, and the 14px the
// chevron is given below. Approximate, and it can afford to be — the
// answer never grows past "Yes", and this is the room after the marker
// rather than the marker's own, which is measured.
const ANSWER_WIDTH = 46;

// Where each field's own value starts, measured from the field's left
// edge: set here rather than taken from `useLeadSection`'s measured
// `room`, which leaves these two markers a gap wider than they read
// well with. The markers are fixed strings (`APPLICATION_LEAD` and
// `QUIT_LEAD` below), so a figure each is as stable as a measurement —
// but a reworded marker needs its figure redone by hand.
const APPLICATION_ROOM = 42;
const QUIT_ROOM = 115;

// The white markers leading these two fields — the same gesture
// `Typography` makes with "Text" (see `leadSection`), rather than labels
// of their own outside the fields. Handed to `useLeadSection`, which
// both draws each one and measures the room the value needs to clear
// it.
const APPLICATION_LEAD = "Open";
const QUIT_LEAD = "Quit on long press";

// The yes/no answer as the select actually carries it: a `Select`'s value
// is a string either way, and these two read in the DOM as what they mean.
const ANSWERS: Option[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

// One request for the whole app, shared by every instance of this editor:
// the installed applications are the same list for all of them, and it is
// the slow one here — the agent reads one `Info.plist` per bundle to build
// it — so opening a second panel must not pay for it again. The same
// bargain `blocks/Typography` makes with `/api/fonts`, with one
// difference: a rejection is dropped rather than cached, so a mount after
// the agent comes back retries instead of inheriting the old failure.
let applicationsRequest: Promise<Application[]> | undefined;

function loadApplications() {
  applicationsRequest ??= fetch("/api/applications")
    .then(async (response) => {
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error || "Unable to load applications");
      }
      return (await response.json()) as Application[];
    })
    .catch((cause: unknown) => {
      applicationsRequest = undefined;
      throw cause;
    });
  return applicationsRequest;
}

/**
 * What this plugin does when the key it's attached to is used: which
 * application to launch, and whether holding the key quits that
 * application instead.
 *
 * Application's own, not a shared block: every Invoke plugin has an
 * action, but no two are the same one (a layer to switch to, a key
 * combination to send, an application to raise), so there is nothing here
 * for a second plugin to reuse beyond the group itself — see
 * `invoke-layer`'s own `Action` for the same reasoning.
 *
 * An *optional* group, like every block in `shared/web/blocks`: a key
 * carries as many actions as it's given — several of the same kind
 * included, each one its own instance, run top to bottom in the order the
 * Properties list shows them — so no single instance is the key's one
 * behaviour, and an instance with its group closed is simply a step that
 * says nothing for the state being edited (its fields come back from the
 * manifest's `defaultConfig`, i.e. no application, no long press).
 * Detaching the instance in the Properties list is still what removes the
 * step itself.
 */
export default function Action({
  config,
  stored,
  onChange,
  disabled = false,
}: BlockProps<ApplicationConfig>) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadApplications()
      .then((items) => {
        if (!cancelled) {
          setApplications(items);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setApplications([]);
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load applications",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const options: Option[] = useMemo(
    () => applications.map(({ id, name }) => ({ value: id, label: name })),
    [applications],
  );

  const selected = applications.find(
    (item) => item.id === config.applicationId,
  );
  // Only ever true for an application the list has actually described:
  // while the fetch is still on its way there is nothing to ask about yet.
  const canQuit = selected?.canQuit ?? false;

  const applicationLead = useLeadSection(APPLICATION_LEAD);
  // The one marker here that isn't simply white: an application the agent
  // can't be asked to quit greys out the question along with its answer,
  // which is the whole of what the panel says about it.
  const quitLead = useLeadSection(QUIT_LEAD, {
    color: disabled || !canQuit ? "dimmed" : "#ffffff",
  });

  // Every write builds on what's stored, never on the merged view — see
  // `BlockProps`: answering the long press must not also freeze today's
  // default application into the state's own config.
  const write = (patch: Partial<ApplicationConfig>) =>
    onChange({ ...stored, ...patch });

  function remove() {
    const remaining: Partial<ApplicationConfig> = { ...stored };
    for (const key of ACTION_KEYS) delete remaining[key];
    onChange(remaining);
  }

  // `applicationId` is the field the action is actually *about*, so its
  // presence is the group's — the long-press answer alone would leave a
  // group that says nothing. `null` counts as stored (that's "no
  // application picked yet", which the select shows as its placeholder);
  // only `undefined` is "not set at all".
  const active = stored.applicationId !== undefined;

  // What a fresh group launches: the first application the list offers, so
  // the step does something the moment it's added. `null` only while the
  // list is still on its way (or has nothing in it) — the effect below
  // finishes the job when it lands.
  const firstApplication = applications[0] ?? null;

  // The list arrives after the panel does, so a group added before the
  // fetch came back has no first application to take yet. Fill it in as
  // soon as there is one rather than leaving the group sitting on its
  // placeholder — only while the group is open and still says no
  // application, which is a state nothing else can put it back into (the
  // select can't be deselected).
  useEffect(() => {
    if (!active || config.applicationId != null || firstApplication == null)
      return;
    write({
      applicationId: firstApplication.id,
      // The same correction the select makes for a hand-picked
      // application: one the agent can't be asked to quit has no long
      // press to offer, so the answer can't stay set on something that
      // would never happen.
      quitOnLongPress:
        firstApplication.canQuit && (config.quitOnLongPress ?? false),
    });
    // `write` closes over what's stored, which is exactly what this reads
    // at the moment it fires; the three values above are the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, config.applicationId, firstApplication]);

  return (
    <PropertyGroup
      title="Action"
      active={active}
      onAdd={() =>
        write({
          // The first application the list offers, exactly as
          // `invoke-layer` takes its first layer, so the step launches
          // something the moment it's added rather than waiting on the
          // select. Still `null` if the list hasn't landed yet — the
          // effect above fills it in once it has.
          applicationId: config.applicationId ?? firstApplication?.id ?? null,
          quitOnLongPress:
            config.quitOnLongPress ?? DEFAULT_QUIT_ON_LONG_PRESS,
        })
      }
      onRemove={remove}
    >
      <Stack gap="xs">
        {/* The marker leads the field itself rather than labelling it
            from outside, exactly as `Typography` leads its own text with
            "Text": the application's name follows the marker on the one
            line, so the row reads as a sentence instead of a label
            meeting its answer somewhere in the middle. */}
        <Select
          variant="unstyled"
          size="xs"
          w="100%"
          aria-label="Application"
          placeholder="Select an application"
          searchable
          leftSection={applicationLead.section}
          // Decorative: the field's accessible name is its `aria-label`,
          // and a click on the marker is meant for the field — see
          // `leadSection`.
          leftSectionPointerEvents="none"
          // Whatever went wrong loading the list is said inside the
          // dropdown, where the missing options are — the field itself
          // carries no message of its own: "no application picked" is
          // what the placeholder already says, and a red line under
          // every fresh step is noise rather than news.
          nothingFoundMessage={error ?? "No application found"}
          allowDeselect={false}
          data={options}
          value={config.applicationId ?? null}
          disabled={disabled}
          onChange={(value) => {
            const next = applications.find((item) => item.id === value);
            write({
              applicationId: value,
              // An application the agent can't be asked to quit has no
              // long press to offer, so the answer goes back to No along
              // with it rather than staying set on something that would
              // never happen.
              quitOnLongPress:
                (next?.canQuit ?? false) && (config.quitOnLongPress ?? false),
            });
          }}
          // The same two corrections every `unstyled` select in these
          // panels needs (see `ux/UnitSelect`): no padding of its own to
          // keep the chevron off the text, and a section that would
          // otherwise be as wide as the field is tall — plus the room the
          // marker itself takes at the start, which an `unstyled` input
          // has none of its own to build on.
          styles={{
            input: {
              // Where "Open :" leaves off, as a figure of its own —
              // see `APPLICATION_ROOM`.
              paddingInlineStart: APPLICATION_ROOM,
              paddingInlineEnd: 14,
            },
            section: { width: "auto" },
          }}
        />
        {/* The question leads its own field, like the application above
            it — the marker carries the question on its own, so there is
            no second line of explanation under it, and the answer follows
            it on the same line. Dimmed for an application that can't be
            quit: that's what the greyed-out question and answer are
            saying, rather than a sentence saying it again. */}
        <Select
          variant="unstyled"
          size="xs"
          // The marker plus the widest answer it can be given, rather
          // than the whole row: "Yes"/"No" is as long as this field's
          // value ever gets, so a full-width field would be mostly empty
          // rule. The application above it does take the row — a
          // browser's or application's name is whatever the agent reports
          // it as.
          w={QUIT_ROOM + ANSWER_WIDTH}
          aria-label="Quit on long press"
          leftSection={quitLead.section}
          // Decorative: the field's accessible name is its `aria-label`,
          // and a click on the marker is meant for the field — see
          // `leadSection`.
          leftSectionPointerEvents="none"
          allowDeselect={false}
          data={ANSWERS}
          value={config.quitOnLongPress ? "yes" : "no"}
          // Nothing to answer until an application says whether it can
          // be quit at all.
          disabled={disabled || !canQuit}
          onChange={(value) => write({ quitOnLongPress: value === "yes" })}
          styles={{
            input: {
              paddingInlineStart: QUIT_ROOM,
              paddingInlineEnd: 14,
            },
            section: { width: "auto" },
          }}
        />
      </Stack>
    </PropertyGroup>
  );
}
