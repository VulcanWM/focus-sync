import styles from '@/styles/index.module.css'
import { useRouter } from 'next/router';
import Layout from '@/components/layout';
import { useState, useEffect } from 'react';
import { get_user_from_email } from '@/lib/database'
import { getServerSession } from "next-auth/next"
import { authOptions } from './api/auth/[...nextauth]'
import { GetServerSidePropsContext } from 'next'
import { signIn} from "next-auth/react"

interface IDot {
  top: string;
  left: string; 
  width: string;
}

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

  const [dots, setDots] = useState<IDot[]>([...Array(20)].map(() => ({
    top: Math.random() * 100 + '%',
    left: Math.random() * 100 + '%',
    width: (Math.random() * 10 + 5) + 'px'
   })));

  const dotElements = dots.map((dot, i) => {   
    return (
      <div   
        key={i}       
        className={styles.dot}     
        style={{    
          top: dot.top,      
          left: dot.left,      
          width: dot.width,
          height: dot.width
        }}   
      />    
    )    
   })

  useEffect(() => {
    const interval = setInterval(() => {
      setDots([...Array(20)].map(() => ({      
        top: Math.random() * 100 + '%',
        left: Math.random() * 100 + '%',
        width: (Math.random() * 10 + 5) + 'px'
      })));
    }, 4000);  
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout pageTitle="Home">
      {dotElements}
      <div id="middle">
        <h1 className={styles.title}>FocusSync</h1>
        {/* <p className={styles.caption}>community driven productivity website that makes achieving your goals social and fun</p> */}
        <ul>
          <li className={styles.point}>Set a goal</li>
          <li className={styles.point}>Track the time you spend on each task</li>
          <li className={styles.point}>Stay motivated by seeing how others are performing</li>
        </ul>
        <button onClick={redirectToJoin} className={styles.join_button}><span className={styles.join_link}>join us</span></button>
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