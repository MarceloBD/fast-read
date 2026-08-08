import { marked, type Token } from "marked";
import { DocumentParserPort } from "../../application/ports/DocumentParserPort";
import { ContentBlock } from "../../domain/entities/ContentBlock";
import { ContentType } from "../../domain/enums/ContentType";

export class MarkdownParser implements DocumentParserPort {
  async parse(input: File | string): Promise<ContentBlock[]> {
    const text = typeof input === "string" ? input : await input.text();
    const tokens = marked.lexer(text);

    return this.processTokens(tokens);
  }

  private processTokens(tokens: Token[]): ContentBlock[] {
    const blocks: ContentBlock[] = [];

    for (const token of tokens) {
      switch (token.type) {
        case "heading":
          blocks.push(
            new ContentBlock({
              type: ContentType.HEADING,
              content: this.stripInlineMarkdown(token.text),
            })
          );
          break;

        case "code":
          blocks.push(
            new ContentBlock({
              type: ContentType.CODE,
              content: token.text,
              language: token.lang || undefined,
            })
          );
          break;

        case "paragraph": {
          const imageMatch = token.text.match(/!\[([^\]]*)\]\(([^)]+)\)/);
          if (imageMatch) {
            blocks.push(
              new ContentBlock({
                type: ContentType.IMAGE,
                content: imageMatch[1] || "image",
                imageUrl: imageMatch[2],
              })
            );
          } else {
            const cleanText = this.stripInlineMarkdown(token.text);
            if (cleanText.trim()) {
              blocks.push(
                new ContentBlock({
                  type: ContentType.TEXT,
                  content: cleanText,
                })
              );
            }
          }
          break;
        }

        case "list":
          for (const item of token.items) {
            const cleanText = this.stripInlineMarkdown(item.text);
            if (cleanText.trim()) {
              blocks.push(
                new ContentBlock({
                  type: ContentType.TEXT,
                  content: cleanText,
                })
              );
            }
          }
          break;

        case "blockquote":
          if (token.text.trim()) {
            blocks.push(
              new ContentBlock({
                type: ContentType.TEXT,
                content: this.stripInlineMarkdown(token.text),
              })
            );
          }
          break;

        default:
          break;
      }
    }

    if (blocks.length === 0) {
      throw new Error("No content found in markdown");
    }

    return blocks;
  }

  private stripInlineMarkdown(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/__(.+?)__/g, "$1")
      .replace(/_(.+?)_/g, "$1")
      .replace(/~~(.+?)~~/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      .trim();
  }
}
