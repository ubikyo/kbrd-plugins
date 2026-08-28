import {
  Combobox,
  Input,
  InputBase,
  Slider,
  Stack,
  Switch,
  useCombobox,
} from "@mantine/core";
import PropertyRow from "./PropertyRow";

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
      <PropertyRow label="Position">
        <Combobox.Target>
          <InputBase
            component="button"
            type="button"
            aria-label="Position"
            w="100%"
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
      </PropertyRow>

      <Combobox.Dropdown>
        <Combobox.Options>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 6,
              overflow: "hidden",
              padding: 6,
            }}
          >
            {positions.map(([itemVertical, itemHorizontal, icon, itemLabel]) => {
              const itemValue = `${itemVertical}:${itemHorizontal}`;
              const selected = itemValue === value;
              return (
                <Combobox.Option
                  key={itemValue}
                  value={itemValue}
                  selected={selected}
                  aria-label={itemLabel}
                  title={itemLabel}
                  style={{
                    alignItems: "center",
                    aspectRatio: "1.6",
                    backgroundColor: selected
                      ? "var(--mantine-primary-color-filled)"
                      : undefined,
                    display: "flex",
                    fontSize: 22,
                    justifyContent: "center",
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
      <PropertyRow label="Precise placement ?" align="center" compactControl>
        <Switch
          aria-label="Precise placement ?"
          checked={config.precisePlacement ?? false}
          disabled={disabled}
          onChange={(event) =>
            set("precisePlacement", event.currentTarget.checked)
          }
        />
      </PropertyRow>
      {config.precisePlacement ? (
        <>
          <PropertyRow label="X" align="top">
            <Input.Wrapper
              w="100%"
              description={`${config.x ?? 50} %`}
            >
              <Slider
                labelAlwaysOn
                mt="xl"
                min={0}
                max={100}
                value={config.x ?? 50}
                disabled={disabled}
                onChange={(value) => set("x", value)}
              />
            </Input.Wrapper>
          </PropertyRow>
          <PropertyRow label="Y" align="top">
            <Input.Wrapper
              w="100%"
              description={`${config.y ?? 50} %`}
            >
              <Slider
                labelAlwaysOn
                mt="xl"
                min={0}
                max={100}
                value={config.y ?? 50}
                disabled={disabled}
                onChange={(value) => set("y", value)}
              />
            </Input.Wrapper>
          </PropertyRow>
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
