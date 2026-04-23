import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import { getDb } from './database.js';
import { initSchema } from './schema.js';
import { seedDummyData } from './dummy-data.js';
import { createAnalyticsRouter } from './routes/analytics.js';
import { createDataRouter } from './routes/data.js';
import { createChatRouter } from './routes/chat.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// CORS configuration:
// - Set ALLOWED_ORIGIN in env to a comma-separated list of allowed origins
//   (e.g. "https://legalpulse.example.com,https://staging.example.com")
// - If unset, allow all origins (dev convenience) but log a warning in production
const allowedOrigin = process.env.ALLOWED_ORIGIN;
if (allowedOrigin) {
  const origins = allowedOrigin.split(',').map(s => s.trim()).filter(Boolean);
  app.use(cors({ origin: origins, credentials: true }));
  console.log(`CORS: restricted to ${origins.join(', ')}`);
} else {
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠ CORS: ALLOWED_ORIGIN is unset in production — permitting all origins. Set ALLOWED_ORIGIN to lock this down.');
  }
  app.use(cors());
}
app.use(express.json({ limit: '10mb' }));

// Create storage directory
const storagePath = path.join(__dirname, 'storage');
fs.mkdirSync(storagePath, { recursive: true });

// Initialize database
const db = await getDb();
initSchema(db);
seedDummyData(db);

// API Routes
app.use('/api/analytics', createAnalyticsRouter(db));
app.use('/api/data', createDataRouter(db));
app.use('/api/chat', createChatRouter(db));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`LegalPulse server running on http://localhost:${PORT}`);
});
