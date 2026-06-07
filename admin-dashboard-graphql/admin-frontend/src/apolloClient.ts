import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const ADMIN_BACKEND_HTTP = import.meta.env.VITE_ADMIN_BACKEND_HTTP || 'http://localhost:4001/graphql';
const ADMIN_BACKEND_WS  = import.meta.env.VITE_ADMIN_BACKEND_WS  || 'ws://localhost:4001/graphql';

const httpLink = new HttpLink({
  uri: ADMIN_BACKEND_HTTP,
  headers: {
    get authorization() {
      return localStorage.getItem('adminToken') || '';
    },
  },
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: ADMIN_BACKEND_WS,
    connectionParams: () => ({
      authorization: localStorage.getItem('adminToken') || '',
    }),
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
