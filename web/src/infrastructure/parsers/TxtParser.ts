import { DocumentParserPort } from "../../application/ports/DocumentParserPort";
import { ContentBlock } from "../../domain/entities/ContentBlock";
import { ContentType } from "../../domain/enums/ContentType";

export class TxtParser implements DocumentParserPort {
  async parse(input: File | string): Promise<ContentBlock[]> {
    const text = typeof input === "string" ? input : await input.text();

    const paragraphs = text
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0);

    if (paragraphs.length === 0) {
      throw new Error("No content found in text");
    }

    return paragraphs.map(
      (paragraph) =>
        new ContentBlock({
          type: ContentType.TEXT,
          content: paragraph,
        })
    );
  }
}
