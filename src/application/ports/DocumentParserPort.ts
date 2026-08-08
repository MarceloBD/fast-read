import { ContentBlock } from "../../domain/entities/ContentBlock";

export interface DocumentParserPort {
  parse(input: File | string): Promise<ContentBlock[]>;
}
