import { Input, SegmentedControl, Slider, Stack, Switch } from "@mantine/core";

export type PlacementConfig = {
  precisePlacement: boolean;
  x: number;
  y: number;
  verticalPosition: "top" | "middle" | "bottom";
  horizontalPosition: "left" | "center" | "right";
};

type Props<T extends PlacementConfig> = {
  config: T;
  onChange: (value: T) => void;
  disabled?: boolean;
};

export default function Placement<T extends PlacementConfig>({
  config,
  onChange,
  disabled = false,
}: Props<T>) {
  function set<K extends keyof PlacementConfig>(
    key: K,
    value: PlacementConfig[K],
  ) {
    onChange({ ...config, [key]: value });
  }

  return (
    <Stack gap="md">
      <Switch
        label="Precise placement"
        checked={config.precisePlacement ?? false}
        disabled={disabled}
        onChange={(event) =>
          set("precisePlacement", event.currentTarget.checked)
        }
      />
      {config.precisePlacement ? (
        <>
          <Input.Wrapper label="X" description={`${config.x ?? 50} %`}>
            <Slider
              mt="xs"
              min={0}
              max={100}
              value={config.x ?? 50}
              disabled={disabled}
              onChange={(value) => set("x", value)}
            />
          </Input.Wrapper>
          <Input.Wrapper label="Y" description={`${config.y ?? 50} %`}>
            <Slider
              mt="xs"
              min={0}
              max={100}
              value={config.y ?? 50}
              disabled={disabled}
              onChange={(value) => set("y", value)}
            />
          </Input.Wrapper>
        </>
      ) : (
        <>
          <Input.Wrapper label="Vertical position">
            <SegmentedControl
              mt="xs"
              fullWidth
              disabled={disabled}
              value={config.verticalPosition ?? "middle"}
              onChange={(value) =>
                set(
                  "verticalPosition",
                  value as PlacementConfig["verticalPosition"],
                )
              }
              data={[
                { label: "Top", value: "top" },
                { label: "Middle", value: "middle" },
                { label: "Bottom", value: "bottom" },
              ]}
            />
          </Input.Wrapper>
          <Input.Wrapper label="Horizontal position">
            <SegmentedControl
              mt="xs"
              fullWidth
              disabled={disabled}
              value={config.horizontalPosition ?? "center"}
              onChange={(value) =>
                set(
                  "horizontalPosition",
                  value as PlacementConfig["horizontalPosition"],
                )
              }
              data={[
                { label: "Left", value: "left" },
                { label: "Center", value: "center" },
                { label: "Right", value: "right" },
              ]}
            />
          </Input.Wrapper>
        </>
      )}
    </Stack>
  );
}
