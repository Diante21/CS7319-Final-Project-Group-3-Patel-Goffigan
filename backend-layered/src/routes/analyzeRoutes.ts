import { Router, Request, Response } from 'express';
import multer from 'multer';
import { analyzeResume } from '../services/analyzeService';
import { getAllResults, getResultById } from '../dataAccess/resultsRepository';

const router = Router();

// Store uploaded files in memory so we can read them as text
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1 * 1024 * 1024 } }); // 1 MB max

// POST /analyze ───────────────────────────────────────────────────────────────
router.post(
  '/analyze',
  upload.single('resume'),
  (req: Request, res: Response): void => {
    let text = '';
    let filename: string | undefined;

    if (req.file) {
      // Multipart file upload
      text = req.file.buffer.toString('utf-8');
      filename = req.file.originalname;
    } else if (req.body && typeof req.body.text === 'string') {
      // JSON / form body with a text field
      text = req.body.text;
    }

    if (!text || text.trim().length === 0) {
      res.status(400).json({
        error: 'No resume text provided. Send JSON { text } or upload a file.',
      });
      return;
    }

    const result = analyzeResume({ text, filename });
    res.status(200).json(result);
  },
);

// GET /results ────────────────────────────────────────────────────────────────
router.get('/results', (_req: Request, res: Response): void => {
  const results = getAllResults();
  res.status(200).json(results);
});

// GET /results/:id ────────────────────────────────────────────────────────────
router.get('/results/:id', (req: Request, res: Response): void => {
  const result = getResultById(req.params.id);
  if (!result) {
    res.status(404).json({ error: `Result with id "${req.params.id}" not found.` });
    return;
  }
  res.status(200).json(result);
});

export default router;
