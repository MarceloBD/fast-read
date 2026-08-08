import ePub from "epubjs";
import type Book from "epubjs/types/book";
import type Section from "epubjs/types/section";
import { DocumentParserPort } from "../../application/ports/DocumentParserPort";
import { ContentBlock } from "../../domain/entities/ContentBlock";
import { ContentType } from "../../domain/enums/ContentType";

export class EpubParser implements DocumentParserPort {
  async parse(input: File | string): Promise<ContentBlock[]> {
    if (typeof input === "string") {
      throw new Error("EPUB parser requires a File input, not a string");
    }

    const arrayBuffer = await input.arrayBuffer();
    const book: Book = ePub(arrayBuffer as ArrayBuffer);
    await book.ready;

    const blocks: ContentBlock[] = [];
    const spine = book.spine as unknown as { items: Section[] };

    for (const section of spine.items) {
      const content = await section.load(book.load.bind(book));
      const document = content as unknown as Document;

      if (document && document.body) {
        const sectionBlocks = this.extractBlocksFromElement(document.body);
        blocks.push(...sectionBlocks);
      }
    }

    if (blocks.length === 0) {
      throw new Error("No content found in EPUB");
    }

    return blocks;
  }

  private extractBlocksFromElement(element: Element): ContentBlock[] {
    const blocks: ContentBlock[] = [];

    for (const child of Array.from(element.children)) {
      const tagName = child.tagName.toLowerCase();

      if (/^h[1-6]$/.test(tagName)) {
        const text = child.textContent?.trim();
        if (text) {
          blocks.push(
            new ContentBlock({ type: ContentType.HEADING, content: text })
          );
        }
        continue;
      }

      if (tagName === "pre" || tagName === "code") {
        const text = child.textContent?.trim();
        if (text) {
          blocks.push(
            new ContentBlock({ type: ContentType.CODE, content: text })
          );
        }
        continue;
      }

      if (tagName === "img") {
        const src = child.getAttribute("src");
        if (src) {
          blocks.push(
            new ContentBlock({
              type: ContentType.IMAGE,
              content: child.getAttribute("alt") || "image",
              imageUrl: src,
            })
          );
        }
        continue;
      }

      if (tagName === "p" || tagName === "div" || tagName === "li") {
        const text = child.textContent?.trim();
        if (text) {
          blocks.push(
            new ContentBlock({ type: ContentType.TEXT, content: text })
          );
        }
        continue;
      }

      const nestedBlocks = this.extractBlocksFromElement(child);
      blocks.push(...nestedBlocks);
    }

    return blocks;
  }
}
