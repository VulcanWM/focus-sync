import Layout from '@/components/layout';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import { GetServerSidePropsContext } from 'next'
import { get_user_from_email, get_open_milestones, get_closed_milestones } from '@/lib/database';
import styles from '@/styles/dashboard.module.css'
import { useState } from 'react';
import axios from 'axios'
import { Trash2, CheckSquare, GitCompareArrows } from 'lucide-react';

type Props = {
  userString: string,
  openMilestonesString: string,
  closedMilestonesString: string
};

type MilestoneType = {
  name: string,
  username: string,
  tasks: string[],
  status: boolean,
  totalTime: number
}

export default function Dashboard( {userString, openMilestonesString, closedMilestonesString}: Props ) {
  const user = JSON.parse(userString)
  const [openMilestones, setOpenMilestones] = useState<MilestoneType[]>(JSON.parse(openMilestonesString))
  const [closedMilestones, setClosedMilestones] = useState<MilestoneType[]>(JSON.parse(closedMilestonesString))
  const [name, setName] = useState<string>("")
  const [msg, setMsg] = useState<string>("")

  async function createMilestone(){
    const userData = {
      name: name
    }
    axios.post(`/api/create-milestone`, userData).then((response) => {
        if (response.data.error == false){
            setOpenMilestones(oldArray => [...oldArray, response.data.data]);
            setName("")
        } else {
            setMsg(response.data.message)
        }
    });
  }

  async function deleteMilestone(milestoneName: string, status: boolean){
    const userData = {
      name: milestoneName
    }
    axios.post(`/api/delete-milestone`, userData).then((response) => {
        if (response.data.error == false){
            if (status == true){
              setOpenMilestones(openMilestones.filter(item => item.name !== milestoneName));
            } else {
              setClosedMilestones(closedMilestones.filter(item => item.name !== milestoneName));
            }
        } else {
            setMsg(response.data.message)
        }
    });
  }

  async function closeMilestone(milestoneName: string){
    const userData = {
      name: milestoneName
    }
    axios.post(`/api/close-milestone`, userData).then((response) => {
        if (response.data.error == false){
            setOpenMilestones(openMilestones.filter(item => item.name !== milestoneName));
            setClosedMilestones(oldArray => [...oldArray, response.data.data]);
        } else {
            setMsg(response.data.message)
        }
    });
  }

  async function reopenMilestone(milestoneName: string){
    const userData = {
      name: milestoneName
    }
    axios.post(`/api/reopen-milestone`, userData).then((response) => {
        if (response.data.error == false){
            setClosedMilestones(closedMilestones.filter(item => item.name !== milestoneName));
            setOpenMilestones(oldArray => [...oldArray, response.data.data]);
        } else {
            setMsg(response.data.message)
        }
    });
  }

  return (
    <Layout pageTitle="Dashboard">
      <div id="content_notcenter">
        <h1>hey {user.username}</h1>
        <h2>Open Milestones</h2>
        { 
            openMilestones.map((milestone: MilestoneType) => ( 
                <div key={milestone.name}>
                    <p><CheckSquare onClick={() => closeMilestone(milestone.name)}/> {milestone.name} <Trash2 onClick={() => deleteMilestone(milestone.name, true)}/> <span className={styles[user.house]}>{milestone.totalTime} mins</span></p>
                </div>
            ))
        }
        <h2>Closed Milestones</h2>
        { 
            closedMilestones.map((milestone: MilestoneType) => ( 
                <div key={milestone.name}>
                    <p><GitCompareArrows onClick={() => reopenMilestone(milestone.name)}/> {milestone.name} <Trash2 onClick={() => deleteMilestone(milestone.name, false)}/> <span className={styles[user.house]}>{milestone.totalTime} mins</span></p>
                </div>
            ))
        }
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
    const openMilestones = await get_open_milestones(user.username)
    const closedMilestones = await get_closed_milestones(user.username)

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
          openMilestonesString: JSON.stringify(openMilestones),
          closedMilestonesString: JSON.stringify(closedMilestones)
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