import type { AppProps } from "next/app";
import { getSession, SessionProvider } from "next-auth/react";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../core/theme";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { UserProvider } from "../core/context/UserContext";
import { PrismaClient, User } from ".prisma/client";
import withPrisma from "../core/prismaClient";
import AuthWrapper from "../components/shared/AuthWrapper";

import "react-contexify/dist/ReactContexify.css";
import "../styles/globals.css";

const App = ({
  Component,
  pageProps: { session, user, ...pageProps },
}: AppProps) => {
  return (
    <SessionProvider session={session}>
      <UserProvider user={user as User | undefined}>
        <AuthWrapper>
          <ChakraProvider theme={theme}>
            <Head>
              <title>State of Turmoil</title>
              <link rel="icon" href="/favicon.png" />
              {process.env.NEXT_PUBLIC_GMAP_KEY && (
                <script
                  id="googleMaps"
                  src={`/api/gmap/maps/api/js?key=${process.env.NEXT_PUBLIC_GMAP_KEY}`}
                  defer
                ></script>
              )}
            </Head>
            <Component {...pageProps} />
          </ChakraProvider>
        </AuthWrapper>
      </UserProvider>
    </SessionProvider>
  );
};

export default App;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const session = await getSession({ req });

  let user: User | null = null;

  if (session && session.user.id) {
    user = await withPrisma(async (client: PrismaClient) => {
      return await client.user.findFirst({ where: { id: session.user.id } });
    });
  }

  return {
    props: {
      session,
      user: user ? JSON.parse(JSON.stringify(user)) : undefined,
    },
  };
};

