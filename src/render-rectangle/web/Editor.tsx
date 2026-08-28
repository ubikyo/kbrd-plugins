import {
  ColorInput,
  Input,
  Slider,
  Stack,
} from "@mantine/core";

import type { RectangleConfig } from "./index";
import Placement from "../../shared/web/Placement";
import PropertyRow from "../../shared/web/PropertyRow";

const swatches = [
  "#ffffff",
  "#adb5bd",
  "#ff6b6b",
  "#ffd43b",
  "#51cf66",
  "#339af0",
  "#845ef7",
  "#000000",
];

type Props = {
  config: RectangleConfig;
  onChange: (value: RectangleConfig) => void;
  disabled?: boolean;
};

export default function Editor({ config, onChange, disabled = false }: Props) {
  function set<K extends keyof RectangleConfig>(
    key: K,
    value: RectangleConfig[K],
  ) {
    onChange({ ...config, [key]: value });
  }

  return (
    <Stack gap="md">
      <Placement config={config} onChange={onChange} disabled={disabled} />
      <PropertyRow label="Width" align="top">
        <Input.Wrapper w="100%" description={`${config.width} %`}>
          <Slider
            labelAlwaysOn
            mt="xl"
            min={5}
            max={100}
            step={5}
            value={config.width}
            disabled={disabled}
            onChange={(value) => set("width", value)}
          />
        </Input.Wrapper>
      </PropertyRow>
      <PropertyRow label="Height" align="top">
        <Input.Wrapper w="100%" description={`${config.height} %`}>
          <Slider
            labelAlwaysOn
            mt="xl"
            min={5}
            max={100}
            step={5}
            value={config.height}
            disabled={disabled}
            onChange={(value) => set("height", value)}
          />
        </Input.Wrapper>
      </PropertyRow>
      <PropertyRow label="Color">
        <ColorInput
          w="100%"
          aria-label="Color"
          format="hex"
          value={config.color ?? "#ffffff"}
          disabled={disabled}
          error={
            /^#[0-9a-f]{6}$/i.test(config.color ?? "#ffffff")
              ? undefined
              : "Invalid color"
          }
          success={/^#[0-9a-f]{6}$/i.test(config.color ?? "#ffffff")}
          swatches={swatches}
          closeOnColorSwatchClick
          onChange={(value) => set("color", value)}
        />
      </PropertyRow>
    </Stack>
  );
}
