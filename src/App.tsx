import { ReaderProvider } from "./presentation/context/ReaderContext";
import { ThemeProvider } from "./presentation/context/ThemeContext";
import { TTSProvider } from "./presentation/context/TTSContext";
import { AppShell } from "./presentation/components/Layout/AppShell";

export function App() {
  return (
    <ReaderProvider>
      <ThemeProvider>
        <TTSProvider>
          <AppShell />
        </TTSProvider>
      </ThemeProvider>
    </ReaderProvider>
  );
}
