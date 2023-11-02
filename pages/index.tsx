import styles from '@/styles/index.module.css'
import { useRouter } from 'next/router';
import Layout from '@/components/layout';
import { useState, useEffect } from 'react';
import { get_user_from_email } from '@/lib/database'
import { getServerSession } from "next-auth/next"
import { authOptions } from './api/auth/[...nextauth]'
import { GetServerSidePropsContext } from 'next'
import { signIn} from "next-auth/react"
import { CalendarCheck, BarChart3, Goal } from 'lucide-react';

type Props = {
  username: any
};

export default function Home( {username}:Props  ) {
  const router = useRouter();

  const redirectToJoin = () => {
    if (username == null){
      signIn(undefined, { callbackUrl: '/create-account' })
    } else if (username == false){
      router.push('/create-account');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <Layout pageTitle="Home">
      <div id="textCenter">
        {/* <h1 className={styles.title}>FocusSync</h1> */}
        <p className={styles.description}>Transform dreams into reality with our goal-driven productivity platform.</p>
        <button onClick={redirectToJoin} className={styles.join_button}><span className={styles.join_link}>join us</span></button>
        {/* <ul>
          <li className={styles.point}>Set a goal</li>
          <li className={styles.point}>Track the time you spend on each task</li>
          <li className={styles.point}>Stay motivated by seeing how others are performing</li>
        </ul> */}
        <div className={styles.features}>
          <div className={styles.feature + " " + styles.verdant}>
              <h3 className={styles.featureName + " " + styles.verdantName}><Goal className={styles.icon}/> Set your goal</h3>
              <ul className={styles.list}>
                <li className={styles.point}>Define your goal</li>
                <li className={styles.point}>Could be anything</li>
                <li className={styles.point}>Embark on your productive journey</li>
              </ul>
          </div>
          <div className={styles.feature + " " + styles.azurite}>
              <h3 className={styles.featureName + " " + styles.azuriteName}><CalendarCheck className={styles.icon}/> Submit daily updates</h3>
              <ul className={styles.list}>
                <li className={styles.point}>Log daily progress</li>
                <li className={styles.point}>Enter completed tasks and duration</li>
                <li className={styles.point}>Link task with milestone</li>
              </ul>
          </div>
          <div className={styles.feature + " " + styles.lumos}>
              <h3 className={styles.featureName + " " + styles.lumosName}><BarChart3 className={styles.icon}/> View productivity stats</h3>
              <ul className={styles.list}>
                <li className={styles.point}>Visualise productivity on a calendar</li>
                <li className={styles.point}>Varying shades of green represent productivity levels</li>
                <li className={styles.point}>Easy to spot trends, track progress and stay motivated</li>
              </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(
      context.req,
      context.res,
      authOptions
  )

  if (session){
      var username = null;
      const email = session!.user!.email as string;
      const user = await get_user_from_email(email)
      if (user == false){
        username = false;
      } else {
        username = user.username;
      }
  }
  return {
    props: {
        username: username || null
    },
  }
}