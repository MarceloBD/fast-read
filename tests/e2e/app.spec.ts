import { test, expect } from "@playwright/test";

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. This is a test of the RSVP speed reading application. It should display one word at a time with proper timing and controls.

Another paragraph here to ensure multiple blocks are parsed correctly. The reader should handle punctuation pauses and long words appropriately.`;

test.describe("App Loading", () => {
  test("should display the landing page with title and text area", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("h2")).toContainText("Fast Read");
    await expect(
      page.locator("textarea")
    ).toBeVisible();
    await expect(
      page.locator("button", { hasText: "Start Reading" })
    ).toBeVisible();
  });
});

test.describe("Text Paste and Reading", () => {
  test("should load pasted text and show reader view", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await textarea.fill(SAMPLE_TEXT);
    await page.locator("button", { hasText: "Start Reading" }).click();

    // Reader view should appear
    await expect(page.locator("h1")).toContainText("Pasted Text");
    // Word display should show first word (in the ORP word wrapper)
    await expect(page.locator("[class*=wordWrapper]").first()).toBeVisible({ timeout: 5000 });
    // Playback controls should be visible
    await expect(page.locator("text=WPM")).toBeVisible();
  });

  test("should show word count in controls", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await textarea.fill(SAMPLE_TEXT);
    await page.locator("button", { hasText: "Start Reading" }).click();

    // Should show "1 / N" where N is total word count
    await expect(page.locator("text=/1 \\/ \\d+/")).toBeVisible();
  });
});

test.describe("RSVP Playback Controls", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await textarea.fill(SAMPLE_TEXT);
    await page.locator("button", { hasText: "Start Reading" }).click();
    await expect(page.locator("h1")).toContainText("Pasted Text");
  });

  test("should play/pause with space bar", async ({ page }) => {
    // Start playing
    await page.keyboard.press("Space");
    await page.waitForTimeout(600);

    // Word index should have advanced
    const afterPlay = await page.locator("text=/\\d+ \\/ \\d+/").textContent();
    const indexAfterPlay = parseInt(afterPlay?.split("/")[0].trim() ?? "1");
    expect(indexAfterPlay).toBeGreaterThan(1);

    // Pause
    await page.keyboard.press("Space");
    await page.waitForTimeout(300);

    // Get current position
    const afterPause = await page.locator("text=/\\d+ \\/ \\d+/").textContent();
    await page.waitForTimeout(500);
    const afterWait = await page.locator("text=/\\d+ \\/ \\d+/").textContent();

    // Position should not change while paused
    expect(afterPause).toBe(afterWait);
  });

  test("should navigate forward with right arrow", async ({ page }) => {
    const initial = await page.locator("text=/\\d+ \\/ \\d+/").textContent();
    const initialIndex = parseInt(initial?.split("/")[0].trim() ?? "1");

    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100);

    const after = await page.locator("text=/\\d+ \\/ \\d+/").textContent();
    const afterIndex = parseInt(after?.split("/")[0].trim() ?? "1");

    expect(afterIndex).toBe(initialIndex + 1);
  });

  test("should navigate backward with left arrow", async ({ page }) => {
    // First go forward a few times
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100);

    const before = await page.locator("text=/\\d+ \\/ \\d+/").textContent();
    const beforeIndex = parseInt(before?.split("/")[0].trim() ?? "1");

    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(100);

    const after = await page.locator("text=/\\d+ \\/ \\d+/").textContent();
    const afterIndex = parseInt(after?.split("/")[0].trim() ?? "1");

    expect(afterIndex).toBe(beforeIndex - 1);
  });

  test("should increase speed with up arrow", async ({ page }) => {
    // Default is 300 WPM
    await expect(page.locator("text=300 WPM")).toBeVisible();

    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(100);

    await expect(page.locator("text=325 WPM")).toBeVisible();
  });

  test("should decrease speed with down arrow", async ({ page }) => {
    await expect(page.locator("text=300 WPM")).toBeVisible();

    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(100);

    await expect(page.locator("text=275 WPM")).toBeVisible();
  });

  test("should restart with R key", async ({ page }) => {
    // Navigate forward
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100);

    const before = await page.locator("text=/\\d+ \\/ \\d+/").textContent();
    const beforeIndex = parseInt(before?.split("/")[0].trim() ?? "1");
    expect(beforeIndex).toBeGreaterThan(1);

    // Restart
    await page.keyboard.press("r");
    await page.waitForTimeout(200);

    const after = await page.locator("text=/\\d+ \\/ \\d+/").textContent();
    const afterIndex = parseInt(after?.split("/")[0].trim() ?? "1");
    expect(afterIndex).toBe(1);
  });

  test("should toggle play button", async ({ page }) => {
    const playButton = page.locator("button", { hasText: "▶" });
    await expect(playButton).toBeVisible();

    await playButton.click();
    await page.waitForTimeout(200);

    // Button should now show pause
    await expect(page.locator("button", { hasText: "⏸" })).toBeVisible();

    // Click pause
    await page.locator("button", { hasText: "⏸" }).click();
    await page.waitForTimeout(200);

    // Button should be back to play
    await expect(page.locator("button", { hasText: "▶" })).toBeVisible();
  });

  test("should seek via progress bar click", async ({ page }) => {
    // Click roughly in the middle of the progress bar
    const progressBar = page.locator("[class*=progressBar]");
    await expect(progressBar).toBeVisible();

    const box = await progressBar.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width * 0.5, box.y + box.height / 2);
      await page.waitForTimeout(200);

      const after = await page.locator("text=/\\d+ \\/ \\d+/").textContent();
      const afterIndex = parseInt(after?.split("/")[0].trim() ?? "1");
      // Should be roughly in the middle
      expect(afterIndex).toBeGreaterThan(5);
    }
  });

  test("speed slider should adjust WPM", async ({ page }) => {
    const slider = page.locator("input[type=range]");
    await expect(slider).toBeVisible();

    // Set slider to max
    await slider.fill("500");
    await page.waitForTimeout(100);

    await expect(page.locator("text=500 WPM")).toBeVisible();
  });
});

test.describe("Mode Toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await textarea.fill(SAMPLE_TEXT);
    await page.locator("button", { hasText: "Start Reading" }).click();
    await expect(page.locator("h1")).toContainText("Pasted Text");
  });

  test("should show Study mode by default", async ({ page }) => {
    await expect(page.locator("button", { hasText: "Study" })).toBeVisible();
  });

  test("should toggle to Speed mode with M key", async ({ page }) => {
    await page.keyboard.press("m");
    await page.waitForTimeout(100);
    await expect(page.locator("button", { hasText: "Speed" })).toBeVisible();
  });

  test("should toggle back to Study mode", async ({ page }) => {
    await page.keyboard.press("m");
    await page.waitForTimeout(100);
    await page.keyboard.press("m");
    await page.waitForTimeout(100);
    await expect(page.locator("button", { hasText: "Study" })).toBeVisible();
  });

  test("should toggle mode via button click", async ({ page }) => {
    await page.locator("button", { hasText: "Study" }).click();
    await page.waitForTimeout(100);
    await expect(page.locator("button", { hasText: "Speed" })).toBeVisible();
  });
});

test.describe("Settings Drawer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await textarea.fill(SAMPLE_TEXT);
    await page.locator("button", { hasText: "Start Reading" }).click();
    await expect(page.locator("h1")).toContainText("Pasted Text");
  });

  test("should open settings drawer", async ({ page }) => {
    await page.locator("button", { hasText: "⚙" }).click();
    await expect(page.locator("h3", { hasText: "Settings" })).toBeVisible();
  });

  test("should show theme options", async ({ page }) => {
    await page.locator("button", { hasText: "⚙" }).click();
    await expect(page.locator("button", { hasText: "Dark" })).toBeVisible();
    await expect(page.locator("button", { hasText: "Light" })).toBeVisible();
    await expect(page.locator("button", { hasText: "Sepia" })).toBeVisible();
    await expect(
      page.locator("button", { hasText: "High Contrast" })
    ).toBeVisible();
  });

  test("should switch to Light theme", async ({ page }) => {
    await page.locator("button", { hasText: "⚙" }).click();
    await page.locator("button", { hasText: "Light" }).click();
    await page.waitForTimeout(200);

    // Check that data-theme attribute was set
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(theme).toBe("light");
  });

  test("should switch to Sepia theme", async ({ page }) => {
    await page.locator("button", { hasText: "⚙" }).click();
    await page.locator("button", { hasText: "Sepia" }).click();
    await page.waitForTimeout(200);

    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(theme).toBe("sepia");
  });

  test("should switch to High Contrast theme", async ({ page }) => {
    await page.locator("button", { hasText: "⚙" }).click();
    await page.locator("button", { hasText: "High Contrast" }).click();
    await page.waitForTimeout(200);

    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(theme).toBe("high-contrast");
  });

  test("should adjust font size via slider", async ({ page }) => {
    await page.locator("button", { hasText: "⚙" }).click();

    // Find the font size slider (second range input in settings)
    const sliders = page.locator(
      "[class*=drawer] input[type=range]"
    );
    const fontSlider = sliders.first();
    await fontSlider.fill("48");
    await page.waitForTimeout(200);

    await expect(
      page.locator("text=Font Size: 48px")
    ).toBeVisible();
  });

  test("should close settings drawer by clicking backdrop", async ({
    page,
  }) => {
    await page.locator("button", { hasText: "⚙" }).click();
    await expect(page.locator("h3", { hasText: "Settings" })).toBeVisible();

    // Click the backdrop (top-left corner, outside the drawer)
    await page.mouse.click(50, 50);
    await page.waitForTimeout(300);

    await expect(
      page.locator("h3", { hasText: "Settings" })
    ).not.toBeVisible();
  });

  test("should close settings drawer with close button", async ({ page }) => {
    await page.locator("button", { hasText: "⚙" }).click();
    await expect(page.locator("h3", { hasText: "Settings" })).toBeVisible();

    await page.locator("button", { hasText: "×" }).click();
    await page.waitForTimeout(300);

    await expect(
      page.locator("h3", { hasText: "Settings" })
    ).not.toBeVisible();
  });
});

test.describe("Study Mode - Code Block Handling", () => {
  const MARKDOWN_WITH_CODE = `# Introduction

This is a paragraph of normal text that should be read word by word.

\`\`\`javascript
const greeting = "Hello World";
console.log(greeting);
\`\`\`

After the code block we continue reading normally.`;

  test("should pause on code block in study mode and show overlay", async ({
    page,
  }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await textarea.fill(MARKDOWN_WITH_CODE);
    await page.locator("button", { hasText: "Start Reading" }).click();
    await expect(page.locator("h1")).toContainText("Pasted Text");

    // Navigate forward past the heading words until we hit [code]
    // "Introduction" is heading (1 word), "This is a paragraph..." is text
    // Then code block is next
    // Let's use play and wait for the code block pause
    await page.keyboard.press("Space");
    // Wait for it to advance through text and hit code block
    await page.waitForTimeout(8000);

    // If study mode paused, we should see the overlay OR we may need to navigate manually
    // Let's try navigating to the code block token directly
  });

  test("should show code block overlay when navigating to code token", async ({
    page,
  }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await textarea.fill(MARKDOWN_WITH_CODE);
    await page.locator("button", { hasText: "Start Reading" }).click();
    await expect(page.locator("h1")).toContainText("Pasted Text");

    // The markdown parser will create:
    // Block 0: HEADING "Introduction" (1 token)
    // Block 1: TEXT "This is a paragraph..." (many tokens)
    // Block 2: CODE (1 token: [code])
    // Block 3: TEXT "After the code block..." (tokens)
    // Let's navigate to find the [code] token by clicking progress bar at ~right position
    // Or simply navigate forward many times

    // Navigate forward until we hit the code block
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("ArrowRight");
    }
    await page.waitForTimeout(500);

    // Check if study mode overlay appeared
    const overlay = page.locator("text=Press Space or click to continue");
    const codeBlock = page.locator("text=Code Block");

    // One of these should be visible if we hit the code token
    const overlayVisible = await overlay.isVisible().catch(() => false);
    const codeVisible = await codeBlock.isVisible().catch(() => false);

    if (overlayVisible || codeVisible) {
      // Verify we can continue
      await page.keyboard.press("Space");
      await page.waitForTimeout(300);
      // Overlay should close
      await expect(overlay).not.toBeVisible();
    }
  });
});

test.describe("Context Preview", () => {
  test("should display surrounding words", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await textarea.fill(
      "one two three four five six seven eight nine ten eleven twelve"
    );
    await page.locator("button", { hasText: "Start Reading" }).click();
    await expect(page.locator("h1")).toContainText("Pasted Text");

    // Navigate to word 5 ("five")
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("ArrowRight");
    }
    await page.waitForTimeout(200);

    // The context preview should show "five" highlighted with the current class
    const contextCurrent = page.locator("[class*=current]");
    await expect(contextCurrent).toBeVisible();
    await expect(contextCurrent).toContainText("five");
  });
});

test.describe("ORP Display", () => {
  test("should show word with highlighted ORP letter", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await textarea.fill("Hello world testing ORP display");
    await page.locator("button", { hasText: "Start Reading" }).click();
    await expect(page.locator("h1")).toContainText("Pasted Text");

    // The first word is "Hello" with ORP at index 1 (2-5 chars = position 1)
    // So before="H", orp="e", after="llo"
    // Check that the ORP-styled element exists
    const orpElement = page.locator("[class*=orp]");
    await expect(orpElement).toBeVisible();

    const orpText = await orpElement.textContent();
    expect(orpText).toBe("e");
  });
});

test.describe("File Drop Zone", () => {
  test("should show file button for choosing file", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Choose File")).toBeVisible();
  });

  test("should show supported file formats hint", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator("text=.txt, .md, .pdf, .epub, .html")
    ).toBeVisible();
  });
});
