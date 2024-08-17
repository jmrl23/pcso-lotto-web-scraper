import fastifyStatic from '@fastify/static';
import app from './app';
import path from 'node:path';

async function main() {
  await app.register(fastifyStatic, {
    root: path.resolve(__dirname, '../public'),
  });

  app.listen({
    host: '0.0.0.0',
    port: parseInt(process.env.PORT ?? '3000'),
  });
}
void main();
