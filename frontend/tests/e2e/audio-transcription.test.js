const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const AUDIO_PATH = path.resolve(__dirname, '../assets/NPR News Now-episode-NPR News_ 05-29-2025 12AM EDT.mp3');
const TRANSCRIPT_PATH = path.resolve(__dirname, '../assets/NPR_Transcript.txt');

// Read the verified transcript (first 500 chars for partial match)
const verifiedTranscript = fs.readFileSync(TRANSCRIPT_PATH, 'utf8').replace(/\s+/g, ' ').trim().slice(0, 500);

test('audio upload and transcription', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Upload the audio file (works even if input is hidden)
  await page.setInputFiles('input[type="file"]', AUDIO_PATH);

  // Wait for the transcription result to appear (wait for at least one segment)
  await page.waitForSelector('p.text-gray-800');

  // Get all transcribed text segments
  const segments = await page.$$eval('p.text-gray-800', els => els.map(e => e.textContent).join(' '));
  const normalizedSegments = segments.replace(/\s+/g, ' ').trim();

  // Compare the first 500 chars of the result to the verified transcript
  expect(normalizedSegments.slice(0, 500)).toContain(verifiedTranscript.slice(0, 100));

  // Log for debugging
  console.log('First 500 chars of transcript:', normalizedSegments.slice(0, 500));
}); 