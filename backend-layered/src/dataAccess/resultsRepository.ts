import * as fs from 'fs';
import * as path from 'path';
import { AnalysisResult } from '../models/types';

const DATA_FILE = path.join(__dirname, '../../data/results.json');

function readAll(): AnalysisResult[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8').trim();
    if (!raw) return [];
    return JSON.parse(raw) as AnalysisResult[];
  } catch {
    return [];
  }
}

export function saveResult(result: AnalysisResult): void {
  const all = readAll();
  all.push(result);
  fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2), 'utf-8');
}

export function getAllResults(): AnalysisResult[] {
  return readAll();
}

export function getResultById(id: string): AnalysisResult | undefined {
  return readAll().find((r) => r.id === id);
}
