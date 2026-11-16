import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin bezpieczeństwa: nagłówki HTTP (Zadanie 11) + blokada wrażliwych plików (Zadanie 15)
function twojeKorzenieSecurityPlugin() {
  const blockedPatterns = [
    /^\/\.env/i,
    /^\/\.git/i,
    /^\/package(-lock)?\.json$/i,
    /\.(bak|sql|sqlite|db|pem|key|log|dump)$/i
  ];

  const applySecurityHeaders = (req, res, next) => {
    const url = (req.url || '').split('?')[0];
    if (blockedPatterns.some((pattern) => pattern.test(url))) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: '403 Forbidden — Dostęp do pliku systemowego zablokowany.' }));
      return;
    }

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=(self), usb=()'
    );
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    next();
  };

  return {
    name: 'twojekorzenie-security-middleware',
    configureServer(server) {
      server.middlewares.use(applySecurityHeaders);
    },
    configurePreviewServer(server) {
      server.middlewares.use(applySecurityHeaders);
    }
  };
}

export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), twojeKorzenieSecurityPlugin()],
  // Zadanie 10: Jawna i restrykcyjna konfiguracja CORS
  server: {
    port: 5173,
    host: true,
    cors: {
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://twojekorzenie.pl'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
      credentials: true
    }
  },
  preview: {
    port: 4173,
    cors: {
      origin: ['http://localhost:4173', 'https://twojekorzenie.pl'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  },
  // Zadanie 12: Wyłączenie trybu debugowania i map źródłowych w produkcji
  build: {
    sourcemap: false
  }
}));
