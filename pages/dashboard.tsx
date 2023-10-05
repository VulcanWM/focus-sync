import Layout from '@/components/layout';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import { GetServerSidePropsContext } from 'next'
import { get_user_from_email, get_latest_updates } from '@/lib/database';
import styles from '@/styles/dashboard.module.css'
import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router';
import Link from 'next/link';
import { admins } from '@/lib/admins';

type Props = {
  userString: string,
  updatesString: string,
  admin: boolean
};

type UpdateType = {
  tasks: {
    [task: string]: number;  
  },
  day: number,
  username: string,
  _id: string,
  created: Date
}

export default function Dashboard( {userString, updatesString, admin}: Props ) {
  const router = useRouter();

  const user = JSON.parse(userString)
  const [noMorePosts, setNoMorePosts] = useState(false)
  const [updates, setUpdates] = useState<UpdateType[]>(JSON.parse(updatesString))

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

  async function deleteUpdate(update_id: string){
    const updateData = {
      update_id: update_id
    }
    axios.post(`http://localhost:3000/api/delete-update`, updateData).then((response) => {
        if (response.data.error == false){
            const filteredUpdates = updates.filter(update => update._id !== update_id);
            setUpdates(filteredUpdates);
        } else {
            console.log("error")
        }
    });
    
  }
  
  // onClick={() => (router.push(`/update/${update._id}`))}

  return (
    <Layout pageTitle="Dashboard">
      <div id="content_notcenter">
        <h1>Hello {user.username}</h1>
        
        { 
            updates.map((update: UpdateType, indexUpdate: number) => ( 
                <div key={indexUpdate} className={styles.update}>
                    <p><strong><Link href={`/user/${update.username}`}>{update.username}</Link></strong></p>
                    <p><Link href={`/update/${update._id}`}>Day {update.day}</Link>{admin&&<button onClick={() => (deleteUpdate(update._id))}>delete update</button>}</p>
                    { 
                        Object.keys(update.tasks).map((task: string, indexTask:number) => ( 
                            <div key={indexUpdate + " " + indexTask}>
                                <p className={styles.name}>✓ {task}</p>
                                <p className={`${styles.time} ${styles[user.house]}`}>{update.tasks[task]} mins</p>
                            </div>
                        ))
                    }
                </div>
            ))
        }
        {noMorePosts == false && <button className={styles.more_posts}onClick={getPosts}>get more posts</button>}
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
      const updates = await get_latest_updates()
      const admin = admins.includes(user.username)
      return {
        props: {
          userString: JSON.stringify(user),
          updatesString: JSON.stringify(updates),
          admin: admin
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