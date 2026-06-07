import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { AppDataSource } from './data-source';

const PORT = process.env.PORT || 4001;

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:3001',
];

async function main() {
  await AppDataSource.initialize();
  console.log('✅ Database connected');

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const app = express();
  const httpServer = createServer(app);

  const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        const token =
          (ctx.connectionParams?.authorization as string) ||
          (ctx.connectionParams?.Authorization as string) ||
          '';
        return { token };
      },
    },
    wsServer
  );

  const apolloServer = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await apolloServer.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>({ origin: ALLOWED_ORIGINS, credentials: true }),
    express.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ')
          ? authHeader.slice(7)
          : authHeader;
        return { token };
      },
    })
  );

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  httpServer.listen(PORT, () => {
    console.log(`🚀 Admin GraphQL HTTP  ready at http://localhost:${PORT}/graphql`);
    console.log(`🔌 Admin GraphQL WS    ready at ws://localhost:${PORT}/graphql`);
  });
}

main().catch((err) => {
  console.error('Failed to start admin backend:', err);
  process.exit(1);
});
