import * as fs from 'fs';
import * as path from 'path';

const COUNTER_PATH = path.join(process.cwd(), 'src/utils/counter.json');

function readCounter(): any {
  try {
    if (fs.existsSync(COUNTER_PATH)) {
      const raw = fs.readFileSync(COUNTER_PATH, 'utf8');
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error('Error reading counter:', error.message);
  }
  return {};
}

function writeCounter(data: any) {
  try {
    fs.writeFileSync(COUNTER_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing counter:', error.message);
  }
}

export function getNextQuoteIndex(): number {
  const data = readCounter();
  return data.quotesIndex ?? 0;
}

export function getNextFootballIndex(): number {
  const data = readCounter();
  return data.footballIndex ?? 0;
}

export function updateQuoteCounter(currentIndex: number, MAX_INDEX: number) {
  const nextIndex = (currentIndex + 1) % (MAX_INDEX + 1);
  const data = readCounter();
  data.quotesIndex = nextIndex;
  writeCounter(data);
  console.log(`Quote counter updated: ${currentIndex} → ${nextIndex}`);
}

export function updateFootballCounter(currentIndex: number, MAX_INDEX: number) {
  const nextIndex = (currentIndex + 1) % (MAX_INDEX + 1);
  const data = readCounter();
  data.footballIndex = nextIndex;
  writeCounter(data);
  console.log(`Football counter updated: ${currentIndex} → ${nextIndex}`);
}

export const getRandomIndex = (from: number, to: number) => {
  return Math.floor(Math.random() * (to - from + 1)) + from;
};
