import Layout from '@/components/layout';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import { GetServerSidePropsContext } from 'next'
import { get_user_from_email, get_open_topics, get_closed_topics } from '@/lib/database';
import styles from '@/styles/dashboard.module.css'
import { useState } from 'react';
import axios from 'axios'
import { Trash2, CheckSquare, GitCompareArrows } from 'lucide-react';

type Props = {
  userString: string,
  openTopicsString: string,
  closedTopicsString: string
};

type TopicType = {
  name: string,
  username: string,
  tasks: string[],
  status: boolean,
  totalTime: number
}

export default function Dashboard( {userString, openTopicsString, closedTopicsString}: Props ) {
  const user = JSON.parse(userString)
  const [openTopics, setOpenTopics] = useState<TopicType[]>(JSON.parse(openTopicsString))
  const [closedTopics, setClosedTopics] = useState<TopicType[]>(JSON.parse(closedTopicsString))
  const [name, setName] = useState<string>("")
  const [msg, setMsg] = useState<string>("")

  async function createTopic(){
    const userData = {
      name: name
    }
    axios.post(`/api/create-topic`, userData).then((response) => {
        if (response.data.error == false){
            setOpenTopics(oldArray => [...oldArray, response.data.data]);
            setName("")
        } else {
            setMsg(response.data.message)
        }
    });
  }

  async function deleteTopic(topicName: string, status: boolean){
    const userData = {
      name: topicName
    }
    axios.post(`/api/delete-topic`, userData).then((response) => {
        if (response.data.error == false){
            if (status == true){
              setOpenTopics(openTopics.filter(item => item.name !== topicName));
            } else {
              setClosedTopics(closedTopics.filter(item => item.name !== topicName));
            }
        } else {
            setMsg(response.data.message)
        }
    });
  }

  async function closeTopic(topicName: string){
    const userData = {
      name: topicName
    }
    axios.post(`/api/close-topic`, userData).then((response) => {
        if (response.data.error == false){
            setOpenTopics(openTopics.filter(item => item.name !== topicName));
            setClosedTopics(oldArray => [...oldArray, response.data.data]);
        } else {
            setMsg(response.data.message)
        }
    });
  }

  async function reopenTopic(topicName: string){
    const userData = {
      name: topicName
    }
    axios.post(`/api/reopen-topic`, userData).then((response) => {
        if (response.data.error == false){
            setClosedTopics(closedTopics.filter(item => item.name !== topicName));
            setOpenTopics(oldArray => [...oldArray, response.data.data]);
        } else {
            setMsg(response.data.message)
        }
    });
  }

  return (
    <Layout pageTitle="Dashboard">
      <div id="content_notcenter">
        <h2>Open Topics</h2>
        { 
            openTopics.map((topic: TopicType) => ( 
                <div key={topic.name}>
                    <p><CheckSquare onClick={() => closeTopic(topic.name)}/> {topic.name} <Trash2 onClick={() => deleteTopic(topic.name, true)}/> <span className={styles[user.house]}>{topic.totalTime} mins</span></p>
                </div>
            ))
        }
        <h2>Closed Topics</h2>
        { 
            closedTopics.map((topic: TopicType) => ( 
                <div key={topic.name}>
                    <p><GitCompareArrows onClick={() => reopenTopic(topic.name)}/> {topic.name} <Trash2 onClick={() => deleteTopic(topic.name, false)}/> <span className={styles[user.house]}>{topic.totalTime} mins</span></p>
                </div>
            ))
        }
        <p className={styles.red}>{msg}</p>
        <input id="name" className={styles.input} value={name} placeholder="topic name" type="text" onChange={e => setName(e.target.value)}></input>
        <button className={styles.button} onClick={createTopic}>create topic</button>
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
    const openTopics = await get_open_topics(user.username)
    const closedTopics = await get_closed_topics(user.username)

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
          openTopicsString: JSON.stringify(openTopics),
          closedTopicsString: JSON.stringify(closedTopics)
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