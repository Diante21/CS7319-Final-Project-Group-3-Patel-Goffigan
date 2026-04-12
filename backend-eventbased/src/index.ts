import express from 'express';
import cors from 'cors';

// Register all event handlers (subscriptions) at startup
import { registerParseHandler } from './handlers/parseHandler';
import { registerAnalyzeHandler } from './handlers/analyzeHandler';
import { registerScoreHandler } from './handlers/scoreHandler';
import { registerFeedbackHandler } from './handlers/feedbackHandler';
import { registerStorageHandler } from './handlers/storageHandler';

import analyzeRoutes from './routes/analyzeRoutes';

registerParseHandler();
registerAnalyzeHandler();
registerScoreHandler();
registerFeedbackHandler();
registerStorageHandler();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }),
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ status: 'ok', architecture: 'event-based' });
});

app.use('/api', analyzeRoutes);

app.listen(PORT, () => {
  console.log(`[event-based] Server running on http://localhost:${PORT}`);
});

export default app;
