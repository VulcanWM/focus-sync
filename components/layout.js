import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/layout.module.css'
import Script from 'next/script';

const siteTitle = "FocusSync";

export default function Layout({ pageTitle, children }) {
  const title = `${siteTitle} - ${pageTitle}`;
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta
          name="description"
          content="community based productivity challenge"
        />
        <meta
          name="og:description"
          content="community based productivity challenge"
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
      {['Home', 'Create Account'].includes(pageTitle) == false &&
        <div className={styles.navbar} id="navbar">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/update">Daily Update</Link>
            <Link href="/stats">Stats</Link>
        </div>
      }
      <div className={styles.content}>
        <main>{children}</main>
      </div>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-LWYYY8S2HJ" />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
        
          gtag('config', 'G-LWYYY8S2HJ');
        `}
      </Script>
    </>
  );
}