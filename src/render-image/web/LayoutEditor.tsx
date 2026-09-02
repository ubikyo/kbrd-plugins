import { Text } from "@mantine/core";

import type { ImageConfig } from "./index";
import Placement from "../../shared/web/Placement";

type Props = {
  config: ImageConfig;
  onChange: (value: ImageConfig) => void;
  disabled?: boolean;
};

export default function LayoutEditor({
  config,
  onChange,
  disabled = false,
}: Props) {
  if (config.fullSize) {
    return (
      <Text size="sm" c="dimmed">
        No placement to configure — this image fills the entire element.
      </Text>
    );
  }
  return <Placement config={config} onChange={onChange} disabled={disabled} />;
}
