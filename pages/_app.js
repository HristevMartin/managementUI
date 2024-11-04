// export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
//   // Use the layout defined at the page level, if available
//   const getLayout = Component.getLayout ?? ((page) => page)

//   return getLayout(<Component {...pageProps} />)
// }


import { SessionProvider } from 'next-auth/react';

export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  // Wrap the layout in SessionProvider to pass the session prop to your application
  return (
    <SessionProvider session={session}>
      {getLayout(<Component {...pageProps} />)}
    </SessionProvider>
  );
}


// import { SessionProvider } from 'next-auth/react';

// function MyApp({ Component, pageProps: { session, ...pageProps } }) {
//   const getLayout = Component.getLayout || ((page) => <SessionProvider session={session}>{page}</SessionProvider>);

//   return getLayout(<Component {...pageProps} />);
// }

// export default MyApp;