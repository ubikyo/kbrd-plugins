import { Group, Select, Stack, Switch, Text } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";

import type { ApplicationConfig } from "./index";

type Application = {
  id: string;
  name: string;
  canQuit: boolean;
};

export default function Editor({
  config,
  onChange,
  disabled = false,
}: {
  config: ApplicationConfig;
  onChange: (value: ApplicationConfig) => void;
  disabled?: boolean;
}) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/applications")
      .then(async (response) => {
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(payload.error || "Unable to load applications");
        }
        return response.json() as Promise<Application[]>;
      })
      .then((items) => {
        if (!cancelled) {
          setApplications(items);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setApplications([]);
          setError(
            reason instanceof Error
              ? reason.message
              : "Unable to load applications",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = applications.find(
    (application) => application.id === config.applicationId,
  );
  const options = useMemo(
    () => applications.map(({ id, name }) => ({ value: id, label: name })),
    [applications],
  );

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="nowrap">
        <Text size="sm">Application</Text>
        <Select
          w={200}
          size="xs"
          searchable
          placeholder="Select"
          nothingFoundMessage="No application found"
          data={options}
          value={config.applicationId ?? null}
          disabled={disabled}
          error={
            error ||
            (!config.applicationId ? "Select an application" : undefined)
          }
          success={!error && Boolean(selected)}
          onChange={(applicationId) =>
            onChange({
              ...config,
              applicationId,
              quitOnLongPress: applicationId
                ? (applications.find((item) => item.id === applicationId)
                    ?.canQuit ?? false) && config.quitOnLongPress
                : false,
            })
          }
        />
      </Group>
      <Switch
        label="Quit on long press"
        description="Hold the key for 0.8 seconds to quit the application"
        checked={config.quitOnLongPress ?? false}
        disabled={disabled || !selected?.canQuit}
        onChange={(event) =>
          onChange({
            ...config,
            quitOnLongPress: event.currentTarget.checked,
          })
        }
      />
    </Stack>
  );
}
