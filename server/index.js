import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import marketRoutes from './routes/market.js';
import optimizeRoutes from './routes/optimize.js';
import explainRoutes from './routes/explain.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/market', marketRoutes);
app.use('/api/optimize', optimizeRoutes);
app.use('/api/explain', explainRoutes);

// In production, serve the Vite build
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`RiskyFrisky API running on http://localhost:${PORT}`);
});
