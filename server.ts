import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { solveAcademicProblem, explainUniverseConcept } from './src/server/geminiService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'OmniStudy AI Universal Tutor' });
});

app.post('/api/solve-problem', async (req, res) => {
  try {
    const result = await solveAcademicProblem(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Solve Problem Error:', error);
    res.status(500).json({ error: error.message || 'Failed to solve problem' });
  }
});

app.post('/api/explain-concept', async (req, res) => {
  try {
    const result = await explainUniverseConcept(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Explain Concept Error:', error);
    res.status(500).json({ error: error.message || 'Failed to explain concept' });
  }
});

// Serve frontend build in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
