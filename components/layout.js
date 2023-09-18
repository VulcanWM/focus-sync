import Head from 'next/head';

const siteTitle = "100 Days of Productivity";

export default function Layout({ pageTitle, children }) {
  const title = `${siteTitle} - ${pageTitle}`;
  return (
    <div>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta
          name="description"
          content=""
        />
        <meta
          name="og:description"
          content=""
        />
        <meta
          property="og:image"
          content="/logo.png"
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:url" content="" />
        <meta property="og:site_name" content={siteTitle} />
        <meta name="robots" content="index, follow"/>
        <meta property="og:type" content="" />
        <meta name="keywords" content=""/>
        <title>{title}</title>
      </Head>
      <main>{children}</main>
    </div>
  );
}