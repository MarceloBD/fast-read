import { ReaderProvider } from "./presentation/context/ReaderContext";
import { ThemeProvider } from "./presentation/context/ThemeContext";
import { TTSProvider } from "./presentation/context/TTSContext";
import { TranslationProvider } from "./presentation/context/TranslationContext";
import { AppShell } from "./presentation/components/Layout/AppShell";
import { TranslationTooltip } from "./presentation/components/Translation/TranslationTooltip";

export function App() {
  return (
    <ReaderProvider>
      <ThemeProvider>
        <TTSProvider>
          <TranslationProvider>
            <AppShell />
            <TranslationTooltip />
          </TranslationProvider>
        </TTSProvider>
      </ThemeProvider>
    </ReaderProvider>
  );
}
