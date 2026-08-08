export const ContentType = {
  TEXT: "TEXT",
  CODE: "CODE",
  IMAGE: "IMAGE",
  HEADING: "HEADING",
} as const;

export type ContentType = (typeof ContentType)[keyof typeof ContentType];
