"use client";

import { useEffect, useRef } from "react";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import rust from "highlight.js/lib/languages/rust";
import sql from "highlight.js/lib/languages/sql";
import java from "highlight.js/lib/languages/java";
import styles from "./StudyModeOverlay.module.css";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("java", java);

interface CodeBlockPanelProps {
  code: string;
  language?: string;
}

export function CodeBlockPanel({ code, language }: CodeBlockPanelProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!codeRef.current) return;

    codeRef.current.textContent = code;

    if (language && hljs.getLanguage(language)) {
      const result = hljs.highlight(code, { language });
      codeRef.current.innerHTML = result.value;
    } else {
      const result = hljs.highlightAuto(code);
      codeRef.current.innerHTML = result.value;
    }
  }, [code, language]);

  return (
    <div>
      <div className={styles.header}>
        <span className={styles.badge}>Code Block</span>
        {language && <span className={styles.language}>{language}</span>}
      </div>
      <pre className={styles.codeBlock}>
        <code ref={codeRef}>{code}</code>
      </pre>
    </div>
  );
}
