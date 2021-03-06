import graphqlHTTP from 'express-graphql';
import schema from './schema';

export default () => {
  return graphqlHTTP({
    schema,
    pretty: true,
  });
};
