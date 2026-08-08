import { DocumentParserPort } from "../../application/ports/DocumentParserPort";
import { ContentBlock } from "../../domain/entities/ContentBlock";
import { ContentType } from "../../domain/enums/ContentType";

export class HtmlParser implements DocumentParserPort {
  async parse(input: File | string): Promise<ContentBlock[]> {
    const html = typeof input === "string" ? input : await input.text();
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");

    const body = document.body;
    const blocks = this.extractBlocks(body);

    if (blocks.length === 0) {
      throw new Error("No content found in HTML");
    }

    return blocks;
  }

  private extractBlocks(element: Element): ContentBlock[] {
    const blocks: ContentBlock[] = [];

    for (const child of Array.from(element.children)) {
      const tagName = child.tagName.toLowerCase();

      if (this.isHeading(tagName)) {
        const text = child.textContent?.trim();
        if (text) {
          blocks.push(
            new ContentBlock({ type: ContentType.HEADING, content: text })
          );
        }
        continue;
      }

      if (tagName === "pre" || tagName === "code") {
        const codeElement = child.querySelector("code") ?? child;
        const text = codeElement.textContent?.trim();
        const language = this.extractLanguageFromClass(codeElement.className);
        if (text) {
          blocks.push(
            new ContentBlock({
              type: ContentType.CODE,
              content: text,
              language,
            })
          );
        }
        continue;
      }

      if (tagName === "img") {
        const src = child.getAttribute("src");
        const alt = child.getAttribute("alt") || "image";
        if (src) {
          blocks.push(
            new ContentBlock({
              type: ContentType.IMAGE,
              content: alt,
              imageUrl: src,
            })
          );
        }
        continue;
      }

      if (this.isBlockElement(tagName)) {
        const imgChild = child.querySelector("img");
        if (imgChild) {
          const src = imgChild.getAttribute("src");
          const alt = imgChild.getAttribute("alt") || "image";
          if (src) {
            blocks.push(
              new ContentBlock({
                type: ContentType.IMAGE,
                content: alt,
                imageUrl: src,
              })
            );
          }
        }

        const text = child.textContent?.trim();
        if (text) {
          blocks.push(
            new ContentBlock({ type: ContentType.TEXT, content: text })
          );
        }
        continue;
      }

      const nestedBlocks = this.extractBlocks(child);
      blocks.push(...nestedBlocks);
    }

    return blocks;
  }

  private isHeading(tagName: string): boolean {
    return /^h[1-6]$/.test(tagName);
  }

  private isBlockElement(tagName: string): boolean {
    const blockElements = [
      "p", "div", "section", "article", "li",
      "blockquote", "figcaption", "td", "th",
    ];
    return blockElements.includes(tagName);
  }

  private extractLanguageFromClass(className: string): string | undefined {
    const match = className.match(/language-(\w+)/);
    return match?.[1];
  }
}
