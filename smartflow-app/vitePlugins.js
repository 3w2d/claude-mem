// Mounts /api/* handlers onto Vite's dev server so `npm run dev`
// runs the full stack (front + OpenAI proxy) with one command.

export function apiPlugin() {
  return {
    name: 'smartflow-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res, next) => {
        try {
          const mod = await server.ssrLoadModule('/api/chat.js');
          await mod.default(req, res);
        } catch (err) {
          console.error('[api/chat] failed:', err);
          next(err);
        }
      });
    },
  };
}
