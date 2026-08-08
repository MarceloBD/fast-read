"use client";

import { useState, useCallback, type DragEvent, type ClipboardEvent } from "react";
import { useReader } from "../../context/ReaderContext";
import { Document } from "../../../domain/entities/Document";
import { FileType } from "../../../domain/enums/FileType";
import { ParserFactory } from "../../../infrastructure/adapters/ParserFactory";
import { TxtParser } from "../../../infrastructure/parsers/TxtParser";
import { MarkdownParser } from "../../../infrastructure/parsers/MarkdownParser";
import styles from "./DropZone.module.css";

const txtParser = new TxtParser();
const markdownParser = new MarkdownParser();

function looksLikeMarkdown(text: string): boolean {
  const markdownPatterns = [
    /^#{1,6}\s/m,
    /\*\*.+?\*\*/,
    /\*.+?\*/,
    /__.+?__/,
    /~~.+?~~/,
    /^```/m,
    /^\s*[-*+]\s/m,
    /^\s*\d+\.\s/m,
    /\[.+?\]\(.+?\)/,
  ];
  return markdownPatterns.some((pattern) => pattern.test(text));
}

export function DropZone() {
  const { loadDocument, state } = useReader();
  const [isDragging, setIsDragging] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasDocument = state.document !== null;

  const handleParseText = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setError(null);
      setIsLoading(true);

      try {
        const isMarkdown = looksLikeMarkdown(text);
        const parser = isMarkdown ? markdownParser : txtParser;
        const fileType = isMarkdown ? FileType.MARKDOWN : FileType.TXT;

        const blocks = await parser.parse(text);
        const document = new Document({
          title: "Pasted Text",
          fileType,
          blocks,
        });
        loadDocument(document);
      } catch (parseError) {
        setError(parseError instanceof Error ? parseError.message : "Failed to parse text");
      } finally {
        setIsLoading(false);
      }
    },
    [loadDocument]
  );

  const handleParseFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsLoading(true);

      try {
        const fileType = ParserFactory.detectFileType(file.name);
        const parser = ParserFactory.getParser(fileType);
        const blocks = await parser.parse(file);
        const document = new Document({
          title: file.name,
          fileType,
          blocks,
        });
        loadDocument(document);
      } catch (parseError) {
        setError(parseError instanceof Error ? parseError.message : "Failed to parse file");
      } finally {
        setIsLoading(false);
      }
    },
    [loadDocument]
  );

  const handlePaste = useCallback(
    (event: ClipboardEvent<HTMLTextAreaElement>) => {
      const pastedText = event.clipboardData.getData("text/plain");
      if (pastedText.trim()) {
        event.preventDefault();
        setTextInput(pastedText);
      }
    },
    []
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        await handleParseFile(files[0]);
      }
    },
    [handleParseFile]
  );

  const handleFileInput = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        await handleParseFile(file);
      }
    },
    [handleParseFile]
  );

  const handleSubmit = useCallback(() => {
    handleParseText(textInput);
  }, [textInput, handleParseText]);

  if (hasDocument) return null;

  return (
    <div
      className={`${styles.container} ${isDragging ? styles.dragging : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={styles.content}>
        <h1 className={styles.title}>Fast Read</h1>
        <p className={styles.subtitle}>
          Paste text or drop a file to start speed reading
        </p>

        {error && <p className={styles.error}>{error}</p>}

        <textarea
          className={styles.textArea}
          placeholder="Paste your text here (Ctrl+V) or type it..."
          value={textInput}
          onChange={(event) => setTextInput(event.target.value)}
          onPaste={handlePaste}
          rows={8}
        />

        <div className={styles.actions}>
          <button
            className={styles.startButton}
            onClick={handleSubmit}
            disabled={!textInput.trim() || isLoading}
          >
            {isLoading ? "Loading..." : "Start Reading"}
          </button>

          <label className={styles.fileButton}>
            Choose File
            <input
              type="file"
              accept=".txt,.md,.markdown,.pdf,.epub,.html,.htm"
              onChange={handleFileInput}
              className={styles.hiddenInput}
            />
          </label>
        </div>

        <div className={styles.dropHint}>
          <span>Drag & drop: .txt, .md, .pdf, .epub, .html</span>
        </div>

        <nav className={styles.navLinks}>
          <a href="/about">About</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </div>
    </div>
  );
}
