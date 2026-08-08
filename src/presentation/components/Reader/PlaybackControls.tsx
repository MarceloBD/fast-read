import { useReader } from "../../context/ReaderContext";
import { useTTS } from "../../context/TTSContext";
import { ReadingSettings } from "../../../domain/value-objects/ReadingSettings";
import { PlayIcon, PauseIcon, VolumeIcon, VolumeMuteIcon, RestartIcon, DocumentIcon } from "../Icons/Icons";
import styles from "./PlaybackControls.module.css";

export function PlaybackControls() {
  const { state, togglePlayPause, seekTo, updateSettings, loadDocument } =
    useReader();
  const { isTTSActive, isTTSPaused, isTTSSupported, toggleTTSEnabled, toggleTTSPause, stopTTS } =
    useTTS();
  const { document: doc, currentIndex, isPlaying, settings } = state;

  const totalWords = doc?.totalWords ?? 0;
  const progress =
    totalWords > 1 ? (currentIndex / (totalWords - 1)) * 100 : 0;

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!doc) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    const targetIndex = Math.round(percentage * (totalWords - 1));
    seekTo(targetIndex);
  };

  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const wordsPerMinute = Number(event.target.value);
    updateSettings(settings.withWordsPerMinute(wordsPerMinute));
  };

  const handleRestart = () => {
    stopTTS();
    if (doc) loadDocument(doc);
  };

  const handleNewDocument = () => {
    stopTTS();
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <div className={styles.progressBar} onClick={handleProgressClick}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={styles.controls}>
        <div className={styles.leftControls}>
          <button
            className={styles.playButton}
            onClick={isTTSActive ? toggleTTSPause : togglePlayPause}
            disabled={!doc}
            title="Play/Pause (Space)"
          >
            {(isPlaying || (isTTSActive && !isTTSPaused)) ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
          </button>

          {isTTSSupported && (
            <button
              className={`${styles.iconButton} ${isTTSActive ? styles.ttsActive : ""}`}
              onClick={toggleTTSEnabled}
              disabled={!doc}
              title={isTTSActive ? "Disable voice (T)" : "Enable voice (T)"}
            >
              {isTTSActive ? <VolumeIcon size={16} /> : <VolumeMuteIcon size={16} />}
            </button>
          )}

          <button
            className={styles.iconButton}
            onClick={handleRestart}
            disabled={!doc}
            title="Restart (R)"
          >
            <RestartIcon size={16} />
          </button>

          <button
            className={styles.iconButton}
            onClick={handleNewDocument}
            title="Load new document"
          >
            <DocumentIcon size={16} />
          </button>
        </div>

        <div className={styles.info}>
          <span className={styles.wordCount}>
            {currentIndex + 1} / {totalWords}
          </span>
          {isTTSActive && (
            <span className={styles.ttsIndicator}>
              {isTTSPaused ? <><VolumeMuteIcon size={12} /> Paused</> : <><VolumeIcon size={12} /> Speaking</>}
            </span>
          )}
        </div>

        <div className={styles.speedControls}>
          <span className={styles.speedValue}>
            {settings.wordsPerMinute} WPM
          </span>
          <input
            type="range"
            min={ReadingSettings.minWpm}
            max={ReadingSettings.maxWpm}
            step={ReadingSettings.wpmStep}
            value={settings.wordsPerMinute}
            onChange={handleSpeedChange}
            className={styles.speedSlider}
            title="Speed (Up/Down arrows)"
          />
        </div>
      </div>
    </div>
  );
}
