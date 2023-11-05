import Layout from '@/components/layout';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import { GetServerSidePropsContext } from 'next'
import { get_user_from_email, get_open_topics } from '@/lib/database';

type Props = {
  userString: string,
  openTopicsString: string
};

type TopicType = {
  name: string,
  username: string,
  tasks: string[],
  status: boolean,
  totalTime: number
}

export default function Dashboard( {userString, openTopicsString}: Props ) {
  const user = JSON.parse(userString)
  const openTopics = JSON.parse(openTopicsString)

  return (
    <Layout pageTitle="Dashboard">
      <div id="content_notcenter">
        { 
            openTopics.map((topic: TopicType) => ( 
                <div key={topic.name}>
                    <p>{topic.name} {topic.totalTime} mins {topic.tasks.length} {topic.totalTime/topic.tasks.length}</p>
                </div>
            ))
        }
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
          openTopicsString: JSON.stringify(openTopics)
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