import { Select, Stack, TextInput } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";

import type { WebsiteConfig } from "./index";
import PropertyRow from "../../shared/web/PropertyRow";

type Browser = {
  id: string;
  name: string;
};

export default function MappingEditor({
  config,
  onChange,
  disabled = false,
}: {
  config: WebsiteConfig;
  onChange: (value: WebsiteConfig) => void;
  disabled?: boolean;
}) {
  const [browsers, setBrowsers] = useState<Browser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/browsers")
      .then(async (response) => {
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(payload.error || "Unable to load browsers");
        }
        return response.json() as Promise<Browser[]>;
      })
      .then((items) => {
        if (!cancelled) {
          setBrowsers(items);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setBrowsers([]);
          setError(
            reason instanceof Error ? reason.message : "Unable to load browsers",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = browsers.find((browser) => browser.id === config.browserId);
  const options = useMemo(
    () => browsers.map(({ id, name }) => ({ value: id, label: name })),
    [browsers],
  );

  return (
    <Stack gap="md">
      <PropertyRow label="URL">
        <TextInput
          w="100%"
          size="xs"
          placeholder="https://example.com"
          value={config.url ?? ""}
          disabled={disabled}
          error={config.url ? undefined : "Enter a URL"}
          success={Boolean(config.url)}
          onChange={(event) =>
            onChange({ ...config, url: event.currentTarget.value })
          }
        />
      </PropertyRow>
      <PropertyRow label="Browser">
        <Select
          w="100%"
          size="xs"
          searchable
          placeholder="Select"
          nothingFoundMessage="No browser found"
          data={options}
          value={config.browserId ?? null}
          disabled={disabled}
          error={
            error || (!config.browserId ? "Select a browser" : undefined)
          }
          success={!error && Boolean(selected)}
          onChange={(browserId) => onChange({ ...config, browserId })}
        />
      </PropertyRow>
    </Stack>
  );
}
