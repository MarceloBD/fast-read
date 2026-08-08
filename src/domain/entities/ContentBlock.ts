import { ContentType } from "../enums/ContentType";

export class ContentBlock {
  readonly type: ContentType;
  readonly content: string;
  readonly language?: string;
  readonly imageUrl?: string;

  constructor(params: {
    type: ContentType;
    content: string;
    language?: string;
    imageUrl?: string;
  }) {
    this.validate(params);
    this.type = params.type;
    this.content = params.content;
    this.language = params.language;
    this.imageUrl = params.imageUrl;
  }

  private validate(params: {
    type: ContentType;
    content: string;
    language?: string;
    imageUrl?: string;
  }): void {
    if (!params.type) {
      throw new Error("ContentBlock type is required");
    }

    if (params.type === ContentType.IMAGE && !params.imageUrl) {
      throw new Error("IMAGE content block requires an imageUrl");
    }

    if (params.type !== ContentType.IMAGE && !params.content.trim()) {
      throw new Error("Non-image content block requires content text");
    }
  }

  get isSpecialContent(): boolean {
    return this.type === ContentType.CODE || this.type === ContentType.IMAGE;
  }
}
