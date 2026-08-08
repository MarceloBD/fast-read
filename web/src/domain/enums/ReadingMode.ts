export const ReadingMode = {
  SPEED: "SPEED",
  STUDY: "STUDY",
} as const;

export type ReadingMode = (typeof ReadingMode)[keyof typeof ReadingMode];
