import Layout from '@/components/layout';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import { GetServerSidePropsContext } from 'next'
import { get_user_from_email, get_latest_updates, create_update } from '@/lib/database';
import styles from '@/styles/dashboard.module.css'
import { useState } from 'react'

type Props = {
  userString: string,
  updatesString: string
};

type UpdateType = {
  tasks: {
    [task: string]: number;  
  },
  day: number,
  username: string
}

export default function Home( {userString, updatesString}: Props ) {
  const user = JSON.parse(userString)
  const [updates, setUpdates] = useState(JSON.parse(updatesString))
  return (
    <Layout pageTitle="Home">
      <div id="content_notcenter">
        <h1>Hello {user.username}</h1>
        { 
            updates.map((update: UpdateType, index: number) => ( 
                <div className={styles.update}>
                    <p><strong>{update.username}</strong></p>
                    <p>Day {update.day}</p>
                    { 
                        Object.keys(update.tasks).map((task: string, index:number) => ( 
                            <>
                                <p className={styles.name}>✓ {task}</p>
                                <p className={`${styles.time} ${styles[user.house]}`}>{update.tasks[task]} mins</p>
                            </>
                        ))
                    }
                </div>
            ))
        }
        <button>get more posts</button>
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
    const email = session!.user!.email as string;
    const user = await get_user_from_email(email)

    if (user == false){
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    } else {
      // for (let i = 1; i <= 31; i++) {
      //   await create_update(user.username, new Date(`2023-09-${String(i)}`), 3, {"chem": i})
      // }
      const updates = await get_latest_updates()
      console.log(updates)
      return {
        props: {
          userString: JSON.stringify(user),
          updatesString: JSON.stringify(updates)
        },
      }
    }
  } else {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
}