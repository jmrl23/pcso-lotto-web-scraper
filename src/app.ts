import fastify, { FastifyRequest } from 'fastify';
import LottoScrapper from './LottoScrapper';
import { resultsGetSchema } from './schema';

const app = fastify({
  logger: true,
});

interface ResultsGet {
  from: string;
  to?: string;
  games?: string[];
}

app.route({
  method: 'POST',
  url: '/results',
  schema: {
    body: resultsGetSchema,
  },
  async handler(
    request: FastifyRequest<{
      Body: ResultsGet;
    }>,
  ) {
    const { from, to, games } = request.body;
    const lottoScrapper = new LottoScrapper();
    const results = await lottoScrapper.get({
      from,
      to,
      filter(result) {
        if (!games) return true;
        return games.includes(result.game);
      },
    });
    return { data: results };
  },
});

export default app;
