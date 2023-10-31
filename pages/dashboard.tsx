import Layout from '@/components/layout';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import { GetServerSidePropsContext } from 'next'
import { get_user_from_email } from '@/lib/database';
import styles from '@/styles/dashboard.module.css'
import { useState } from 'react';
import axios from 'axios'

type Props = {
  userString: string,
};

export default function Dashboard( {userString}: Props ) {
  const user = JSON.parse(userString)
  const [name, setName] = useState<string>("")
  const [msg, setMsg] = useState<string>("")

  async function createMilestone(){
    const userData = {
      name: name
    }
    axios.post(`/api/create-milestone`, userData).then((response) => {
        if (response.data.error == false){
            // add to milestones
            setMsg("created")
        } else {
            setMsg(response.data.message)
        }
    });
}

  return (
    <Layout pageTitle="Dashboard">
      <div id="content_notcenter">
        <h1>hey {user.username}</h1>
        <p className={styles.red}>{msg}</p>
        <input id="name" className={styles.input} value={name} placeholder="milestone name" type="text" onChange={e => setName(e.target.value)}></input>
        <button className={styles.button} onClick={createMilestone}>create milestone</button>
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
      return {
        props: {
          userString: JSON.stringify(user),
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