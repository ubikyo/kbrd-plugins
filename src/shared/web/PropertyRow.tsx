import { Box, Text } from "@mantine/core";
import type { ReactNode } from "react";

type Props = {
  label: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  align?: "start" | "center" | "top";
  compactControl?: boolean;
};

/** Consistent label/control layout for every plugin property editor. */
export default function PropertyRow({
  label,
  description,
  children,
  align = "start",
  compactControl = false,
}: Props) {
  return (
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 3fr) minmax(0, 7fr)",
        columnGap: "var(--mantine-spacing-md)",
        alignItems: align === "top" ? "start" : align,
      }}
    >
      <Box pt={align === "start" ? 7 : 0}>
        <Text size="sm">{label}</Text>
        {description && (
          <Text size="xs" c="dimmed" mt={2}>
            {description}
          </Text>
        )}
      </Box>
      <Box
        style={{
          minWidth: 0,
          width: "100%",
          display: compactControl ? "flex" : undefined,
          justifyContent: compactControl ? "flex-end" : undefined,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
