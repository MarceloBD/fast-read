import { ContentBlock } from "./ContentBlock";
import { WordToken } from "./WordToken";
import { FileType } from "../enums/FileType";
import { ContentType } from "../enums/ContentType";

export class Document {
  readonly title: string;
  readonly fileType: FileType;
  readonly blocks: ContentBlock[];
  readonly tokens: WordToken[];

  constructor(params: {
    title: string;
    fileType: FileType;
    blocks: ContentBlock[];
  }) {
    this.validate(params);
    this.title = params.title;
    this.fileType = params.fileType;
    this.blocks = params.blocks;
    this.tokens = this.tokenize(params.blocks);
  }

  private validate(params: {
    title: string;
    fileType: FileType;
    blocks: ContentBlock[];
  }): void {
    if (!params.title.trim()) {
      throw new Error("Document title is required");
    }
    if (!params.blocks.length) {
      throw new Error("Document must have at least one content block");
    }
  }

  private tokenize(blocks: ContentBlock[]): WordToken[] {
    const tokens: WordToken[] = [];
    let globalIndex = 0;

    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
      const block = blocks[blockIndex];

      if (block.type === ContentType.IMAGE) {
        tokens.push(
          new WordToken({
            word: "[image]",
            index: globalIndex++,
            contentType: ContentType.IMAGE,
            blockIndex,
          })
        );
        continue;
      }

      if (block.type === ContentType.CODE) {
        tokens.push(
          new WordToken({
            word: "[code]",
            index: globalIndex++,
            contentType: ContentType.CODE,
            blockIndex,
          })
        );
        continue;
      }

      const words = block.content
        .split(/\s+/)
        .filter((word) => word.length > 0);

      for (const word of words) {
        tokens.push(
          new WordToken({
            word,
            index: globalIndex++,
            contentType: block.type,
            blockIndex,
          })
        );
      }
    }

    return tokens;
  }

  get totalWords(): number {
    return this.tokens.length;
  }
}
