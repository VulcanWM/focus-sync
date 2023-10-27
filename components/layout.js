import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/layout.module.css'
import Script from 'next/script';
import Image from 'next/image';
import { Analytics } from '@vercel/analytics/react';

const siteTitle = "FocusSync";

export default function Layout({ pageTitle, children }) {
  const title = `${siteTitle} - ${pageTitle}`;
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="description" content="Community driven productivity website that helps users achieve their goals in a social and fun way. Set goals, track task time, and stay motivated by seeing how others are performing."/>
        <meta name="keywords" content="productivity,goals,tasks,task management,time tracking,motivation,accountability,social productivity,focus,focussync,focus sync"/>
        <meta name="og:description" content="Community driven productivity website that helps users achieve their goals in a social and fun way. Set goals, track task time, and stay motivated by seeing how others are performing."/>
        <meta
          property="og:image"
          content="https://focus-sync.vercel.app/banner.png"
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="https://focus-sync.vercel.app/banner.png" />
        <meta property="og:url" content="https://focus-sync.vercel.app" />
        <meta property="og:site_name" content={siteTitle} />
        <meta name="robots" content="index, follow"/>
        <meta property="og:type" content="Website" />
        <meta name="google-site-verification" content="d3cd3FIDhsMDI3e_zwDnkg4GLGdu-cJu23VVpa-eC6o" />
        <title>{title}</title>
      </Head>
      {['Home', 'Create Account', 'Houses', 'Privacy Policy'].includes(pageTitle) == false ?
        <div className={styles.navbar} id="navbar">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/update">Daily Update</Link>
            <Link href="/stats">Stats</Link>
            <Link href="/insights">Insights</Link>
        </div>
      : <div className={styles.other_navbar} id="navbar">
            <Image className={styles.img} src="/logo.png" width={40} height={40} alt="Logo"></Image>
            <span><Link href="/">focussync</Link></span>
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
      <Analytics />
    </>
  );
}