import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import EventBus, { EVENTS } from '../events/EventBus';
import { FeedbackPayload, StoredPayload, AnalysisResult, ErrorPayload } from '../models/types';

const DATA_FILE = path.join(__dirname, '../../data/results.json');

function readAll(): AnalysisResult[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, 'utf-8').trim();
    if (!raw) return [];
    return JSON.parse(raw) as AnalysisResult[];
  } catch {
    return [];
  }
}

function writeAll(results: AnalysisResult[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(results, null, 2), 'utf-8');
}

export function getAllResults(): AnalysisResult[] {
  return readAll();
}

export function getResultById(id: string): AnalysisResult | undefined {
  return readAll().find((r) => r.id === id);
}

// ── Handler registration ──────────────────────────────────────────────────────

export function registerStorageHandler(): void {
  EventBus.on(EVENTS.RESUME_FEEDBACK_GENERATED, (payload: FeedbackPayload) => {
    try {
      const { correlationId, result } = payload;

      const stored: AnalysisResult = {
        ...result,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
      };

      const all = readAll();
      all.push(stored);
      writeAll(all);

      const storedPayload: StoredPayload = { correlationId, result: stored };
      EventBus.emit(EVENTS.RESUME_STORED, storedPayload);
      EventBus.emit(`${EVENTS.RESUME_STORED}:${correlationId}`, storedPayload);
    } catch (err) {
      const errPayload: ErrorPayload = {
        correlationId: payload.correlationId,
        message: err instanceof Error ? err.message : 'Storage error',
      };
      EventBus.emit(EVENTS.RESUME_ERROR, errPayload);
      EventBus.emit(`${EVENTS.RESUME_ERROR}:${payload.correlationId}`, errPayload);
    }
  });
}
