export const ThemeType = {
  DARK: "DARK",
  LIGHT: "LIGHT",
  SEPIA: "SEPIA",
  HIGH_CONTRAST: "HIGH_CONTRAST",
} as const;

export type ThemeType = (typeof ThemeType)[keyof typeof ThemeType];
