/**
 * Generate short WAV sound effects for TodoMaster.
 *
 * Sounds:
 *   create.wav   — ascending two-note chime (todo created)
 *   complete.wav — satisfying single "ding" (todo completed)
 *   reminder.wav — attention two-tone alert (due date)
 *
 * Usage: node generate-sounds.js
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '..', 'miniprogram', 'audio');
const SAMPLE_RATE = 22050;

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ========== WAV Encoding ==========

function createWav(samples) {
  const dataSize = samples.length * 2; // 16-bit = 2 bytes per sample
  const fileSize = 44 + dataSize;
  const buf = Buffer.alloc(fileSize);

  // RIFF header
  buf.write('RIFF', 0);
  buf.writeUInt32LE(fileSize - 8, 4);
  buf.write('WAVE', 8);

  // fmt chunk
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);        // chunk size
  buf.writeUInt16LE(1, 20);         // PCM format
  buf.writeUInt16LE(1, 22);         // mono
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buf.writeUInt16LE(2, 32);         // block align
  buf.writeUInt16LE(16, 34);        // bits per sample

  // data chunk
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const val = Math.max(-32768, Math.min(32767, Math.round(samples[i])));
    buf.writeInt16LE(val, 44 + i * 2);
  }

  return buf;
}

// ========== Tone Generation ==========

function sine(freq, t) {
  return Math.sin(2 * Math.PI * freq * t);
}

/**
 * Generate a tone with exponential decay envelope
 */
function tone(freq, duration, volume, decayRate) {
  const count = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    const t = i / SAMPLE_RATE;
    const envelope = Math.exp(-t * decayRate) * volume;
    samples[i] = sine(freq, t) * envelope * 32767;
  }
  return samples;
}

/**
 * Mix two sample arrays (add together), second starts at offsetSec
 */
function mix(a, b, offsetSec) {
  const offsetSamples = Math.floor(offsetSec * SAMPLE_RATE);
  const totalLen = Math.max(a.length, b.length + offsetSamples);
  const out = new Float64Array(totalLen);
  for (let i = 0; i < a.length; i++) out[i] += a[i];
  for (let i = 0; i < b.length; i++) out[i + offsetSamples] += b[i];
  return out;
}

/**
 * Add a subtle harmonic overtone for richness
 */
function richTone(freq, duration, volume, decayRate) {
  const fundamental = tone(freq, duration, volume, decayRate);
  const overtone = tone(freq * 2, duration, volume * 0.15, decayRate * 1.5);
  const overtone2 = tone(freq * 3, duration, volume * 0.05, decayRate * 2);
  return mix(mix(fundamental, overtone, 0), overtone2, 0);
}

// ========== Sound Designs ==========

function generateCreate() {
  // Ascending two-note chime: C5 (523Hz) → E5 (659Hz)
  const note1 = richTone(523, 0.2, 0.5, 8);
  const note2 = richTone(659, 0.25, 0.55, 7);
  return mix(note1, note2, 0.12);
}

function generateComplete() {
  // Satisfying "ding": G5 (784Hz) with warm overtones
  const main = richTone(784, 0.35, 0.6, 6);
  // Add a soft sub-octave for warmth
  const sub = tone(392, 0.3, 0.15, 8);
  return mix(main, sub, 0);
}

function generateReminder() {
  // Two-tone attention chime: E5 (659Hz), pause, E5 again (slightly higher)
  const note1 = richTone(659, 0.18, 0.55, 10);
  const note2 = richTone(880, 0.22, 0.5, 8);
  const note3 = richTone(659, 0.18, 0.55, 10);
  return mix(mix(note1, note2, 0.15), note3, 0.32);
}

// ========== Generate ==========

const sounds = [
  { name: 'create.wav', generate: generateCreate },
  { name: 'complete.wav', generate: generateComplete },
  { name: 'reminder.wav', generate: generateReminder },
];

console.log(`Generating ${sounds.length} sound effects ...`);
console.log(`Sample rate: ${SAMPLE_RATE}Hz, 16-bit mono`);
console.log(`Output: ${OUTPUT_DIR}\n`);

for (const sound of sounds) {
  const samples = sound.generate();
  const wav = createWav(samples);
  const outPath = path.join(OUTPUT_DIR, sound.name);
  fs.writeFileSync(outPath, wav);
  const durationMs = Math.round(samples.length / SAMPLE_RATE * 1000);
  console.log(`  ${sound.name}  (${durationMs}ms, ${wav.length} bytes)`);
}

console.log('\nDone.');
