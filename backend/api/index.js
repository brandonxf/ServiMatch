// Punto de entrada serverless de Vercel. Usa el build de NestJS (dist/).
const { getServer } = require('../dist/serverless');

module.exports = async (req, res) => {
  const server = await getServer();
  return server(req, res);
};
