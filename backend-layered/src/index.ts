import express from 'express';
import cors from 'cors';
import analyzeRoutes from './routes/analyzeRoutes';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }),
);
app.use(express.json());

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', architecture: 'layered-monolithic' });
});

// API routes
app.use('/api', analyzeRoutes);

app.listen(PORT, () => {
  console.log(`[layered-monolithic] Server running on http://localhost:${PORT}`);
});

export default app;
