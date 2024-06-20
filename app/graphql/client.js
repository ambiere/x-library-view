import { createClient } from "graphql-ws"
import { getMainDefinition } from "@apollo/client/utilities"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  split,
  HttpLink
} from "@apollo/client"

export default function ClientProvider({ children }) {
  const API_URI = import.meta.env.VITE_API_URI
  const WS_URL = import.meta.env.VITE_WS_API_URL

  const wsClient = createClient({ url: WS_URL })
  const wsLink = new GraphQLWsLink(wsClient)

  const httpLink = new HttpLink({
    uri: API_URI,
    credentials: "include"
  })

  const test = ({ query }) => {
    const def = getMainDefinition(query)
    return (
      def.kind === "OperationDefinition" &&
      def.operation === "subscription"
    )
  }

  const client = new ApolloClient({
    link: split(test, wsLink, httpLink),
    cache: new InMemoryCache()
  })

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  )
}
