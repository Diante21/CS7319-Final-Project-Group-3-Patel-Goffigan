import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import EventBus, { EVENTS } from '../events/EventBus';
import { SubmittedPayload, StoredPayload, ErrorPayload } from '../models/types';
import { getAllResults, getResultById } from '../handlers/storageHandler';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1 * 1024 * 1024 } }); // 1 MB max

const ANALYSIS_TIMEOUT_MS = 30_000;

// POST /analyze ────────────────────────────────────────────────────────────────
router.post(
  '/analyze',
  upload.single('resume'),
  (req: Request, res: Response): void => {
    let text = '';
    let filename: string | undefined;

    if (req.file) {
      text = req.file.buffer.toString('utf-8');
      filename = req.file.originalname;
    } else if (req.body && typeof req.body.text === 'string') {
      text = req.body.text;
    }

    if (!text || text.trim().length === 0) {
      res.status(400).json({
        error: 'No resume text provided. Send JSON { text } or upload a file.',
      });
      return;
    }

    const correlationId = uuidv4();

    const resultPromise = new Promise<StoredPayload>((resolve, reject) => {
      const timer = setTimeout(() => {
        EventBus.removeListener(`${EVENTS.RESUME_STORED}:${correlationId}`, onStored);
        EventBus.removeListener(`${EVENTS.RESUME_ERROR}:${correlationId}`, onError);
        reject(new Error('Analysis timed out after 30 seconds.'));
      }, ANALYSIS_TIMEOUT_MS);

      function onStored(payload: StoredPayload) {
        clearTimeout(timer);
        EventBus.removeListener(`${EVENTS.RESUME_ERROR}:${correlationId}`, onError);
        resolve(payload);
      }

      function onError(payload: ErrorPayload) {
        clearTimeout(timer);
        EventBus.removeListener(`${EVENTS.RESUME_STORED}:${correlationId}`, onStored);
        reject(new Error(payload.message));
      }

      EventBus.once(`${EVENTS.RESUME_STORED}:${correlationId}`, onStored);
      EventBus.once(`${EVENTS.RESUME_ERROR}:${correlationId}`, onError);
    });

    const submitted: SubmittedPayload = {
      correlationId,
      input: { text, ...(filename ? { filename } : {}) },
    };
    EventBus.emit(EVENTS.RESUME_SUBMITTED, submitted);

    resultPromise
      .then((stored) => res.status(200).json(stored.result))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Analysis failed.';
        res.status(500).json({ error: message });
      });
  },
);

// GET /results ─────────────────────────────────────────────────────────────────
router.get('/results', (_req: Request, res: Response): void => {
  res.status(200).json(getAllResults());
});

// GET /results/:id ─────────────────────────────────────────────────────────────
router.get('/results/:id', (req: Request, res: Response): void => {
  const result = getResultById(req.params.id);
  if (!result) {
    res.status(404).json({ error: `Result with id "${req.params.id}" not found.` });
    return;
  }
  res.status(200).json(result);
});

export default router;
