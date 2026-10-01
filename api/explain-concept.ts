import { explainUniverseConcept } from '../src/server/geminiService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const result = await explainUniverseConcept(body);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in explain-concept handler:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
