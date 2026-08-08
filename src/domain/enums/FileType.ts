export const FileType = {
  PDF: "PDF",
  EPUB: "EPUB",
  MARKDOWN: "MARKDOWN",
  HTML: "HTML",
  TXT: "TXT",
} as const;

export type FileType = (typeof FileType)[keyof typeof FileType];
