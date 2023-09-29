import Layout from '@/components/layout';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import { GetServerSidePropsContext } from 'next'
import { get_user_from_email, get_latest_updates } from '@/lib/database';
import styles from '@/styles/dashboard.module.css'
import { useState } from 'react'
import axios from 'axios'

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
  const [noMorePosts, setNoMorePosts] = useState(false)
  const [updates, setUpdates] = useState(JSON.parse(updatesString))

  async function getPosts(){
    const userData = {
        created: updates[updates.length - 1].created
    }
    axios.post(`http://localhost:3000/api/next-updates`, userData).then((response) => {
        if (response.data.error == false){
            if (response.data.data.length == 0){
              setNoMorePosts(true)
            }
            const newUpdates = updates.concat(response.data.data);
            setUpdates(newUpdates)
        } else {
            console.log("error")
        }
    });
}

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
        {noMorePosts == false && <button onClick={getPosts}>get more posts</button>}
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
      // const after = await get_latest_updates_after(updates[updates.length - 1].created)
      // console.log(after)
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