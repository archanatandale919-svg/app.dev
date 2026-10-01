import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import { solveAcademicProblem, explainUniverseConcept } from './src/server/geminiService';

dotenv.config();

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          return next();
        }

        if (req.url === '/api/health' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'ok', service: 'OmniStudy AI' }));
          return;
        }

        if (req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });

          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const body = bodyStr ? JSON.parse(bodyStr) : {};

              if (req.url === '/api/solve-problem') {
                const result = await solveAcademicProblem(body);
                res.end(JSON.stringify(result));
                return;
              }

              if (req.url === '/api/explain-concept') {
                const result = await explainUniverseConcept(body);
                res.end(JSON.stringify(result));
                return;
              }

              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Endpoint not found' }));
            } catch (err: any) {
              console.error('API Error:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

