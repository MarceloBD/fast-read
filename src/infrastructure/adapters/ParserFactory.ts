import { FileType } from "../../domain/enums/FileType";
import { DocumentParserPort } from "../../application/ports/DocumentParserPort";
import { TxtParser } from "../parsers/TxtParser";
import { MarkdownParser } from "../parsers/MarkdownParser";
import { HtmlParser } from "../parsers/HtmlParser";
import { PdfParser } from "../parsers/PdfParser";
import { EpubParser } from "../parsers/EpubParser";

const EXTENSION_TO_FILE_TYPE: Record<string, FileType> = {
  ".txt": FileType.TXT,
  ".text": FileType.TXT,
  ".md": FileType.MARKDOWN,
  ".markdown": FileType.MARKDOWN,
  ".html": FileType.HTML,
  ".htm": FileType.HTML,
  ".pdf": FileType.PDF,
  ".epub": FileType.EPUB,
};

export class ParserFactory {
  private static parsers: Record<FileType, DocumentParserPort> = {
    [FileType.TXT]: new TxtParser(),
    [FileType.MARKDOWN]: new MarkdownParser(),
    [FileType.HTML]: new HtmlParser(),
    [FileType.PDF]: new PdfParser(),
    [FileType.EPUB]: new EpubParser(),
  };

  static getParser(fileType: FileType): DocumentParserPort {
    return this.parsers[fileType];
  }

  static detectFileType(fileName: string): FileType {
    const extension = fileName
      .slice(fileName.lastIndexOf("."))
      .toLowerCase();

    const fileType = EXTENSION_TO_FILE_TYPE[extension];

    if (!fileType) {
      return FileType.TXT;
    }

    return fileType;
  }

  static getSupportedExtensions(): string[] {
    return Object.keys(EXTENSION_TO_FILE_TYPE);
  }
}
