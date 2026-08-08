import * as pdfjsLib from "pdfjs-dist";
import { DocumentParserPort } from "../../application/ports/DocumentParserPort";
import { ContentBlock } from "../../domain/entities/ContentBlock";
import { ContentType } from "../../domain/enums/ContentType";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

export class PdfParser implements DocumentParserPort {
  async parse(input: File | string): Promise<ContentBlock[]> {
    const arrayBuffer = typeof input === "string"
      ? new TextEncoder().encode(input).buffer
      : await input.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const blocks: ContentBlock[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item) => {
          if ("str" in item) return item.str;
          return "";
        })
        .join(" ")
        .trim();

      if (pageText) {
        const paragraphs = pageText
          .split(/\n\s*\n/)
          .filter((paragraph) => paragraph.trim().length > 0);

        for (const paragraph of paragraphs) {
          blocks.push(
            new ContentBlock({
              type: ContentType.TEXT,
              content: paragraph.trim(),
            })
          );
        }
      }
    }

    if (blocks.length === 0) {
      throw new Error("No text content found in PDF");
    }

    return blocks;
  }
}
