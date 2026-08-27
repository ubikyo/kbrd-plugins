import {
  Combobox,
  FloatingIndicator,
  Input,
  InputBase,
  Slider,
  Stack,
  Switch,
  useCombobox,
} from "@mantine/core";
import { useRef, useState } from "react";

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

const positions = [
  ["top", "left", "↖", "Top Left"],
  ["top", "center", "↑", "Top Center"],
  ["top", "right", "↗", "Top Right"],
  ["middle", "left", "←", "Middle Left"],
  ["middle", "center", "•", "Center"],
  ["middle", "right", "→", "Middle Right"],
  ["bottom", "left", "↙", "Bottom Left"],
  ["bottom", "center", "↓", "Bottom Center"],
  ["bottom", "right", "↘", "Bottom Right"],
] as const;

function PositionSelect<T extends PlacementConfig>({
  config,
  onChange,
  disabled,
}: Props<T>) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const controls = useRef<Record<string, HTMLDivElement | null>>({});
  const vertical = config.verticalPosition ?? "middle";
  const horizontal = config.horizontalPosition ?? "center";
  const value = `${vertical}:${horizontal}`;
  const label =
    positions.find(
      ([itemVertical, itemHorizontal]) =>
        itemVertical === vertical && itemHorizontal === horizontal,
    )?.[3] ?? "Center";

  return (
    <Combobox
      store={combobox}
      disabled={disabled}
      onOptionSubmit={(nextValue) => {
        const [verticalPosition, horizontalPosition] = nextValue.split(":") as [
          PlacementConfig["verticalPosition"],
          PlacementConfig["horizontalPosition"],
        ];
        onChange({ ...config, verticalPosition, horizontalPosition });
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          label="Position"
          pointer
          success
          disabled={disabled}
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}
        >
          {label}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          <div
            ref={setRoot}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 6,
              padding: 6,
              position: "relative",
            }}
          >
            <FloatingIndicator
              target={controls.current[value]}
              parent={root}
              style={{
                background: "var(--mantine-primary-color-filled)",
                borderRadius: "var(--mantine-radius-sm)",
                boxShadow: "var(--mantine-shadow-sm)",
              }}
            />
            {positions.map(([itemVertical, itemHorizontal, icon, itemLabel]) => {
              const itemValue = `${itemVertical}:${itemHorizontal}`;
              return (
                <Combobox.Option
                  key={itemValue}
                  value={itemValue}
                  selected={itemValue === value}
                  ref={(node) => {
                    controls.current[itemValue] = node;
                  }}
                  aria-label={itemLabel}
                  title={itemLabel}
                  style={{
                    alignItems: "center",
                    aspectRatio: "1.6",
                    display: "flex",
                    fontSize: 22,
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {icon}
                </Combobox.Option>
              );
            })}
          </div>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

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
        <PositionSelect
          config={config}
          onChange={onChange}
          disabled={disabled}
        />
      )}
    </Stack>
  );
}
