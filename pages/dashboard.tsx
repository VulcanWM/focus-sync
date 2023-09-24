import Layout from '@/components/layout';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import { GetServerSidePropsContext } from 'next'
import { get_user_from_email } from '@/lib/database';

type Props = {
  userString: string
};

export default function Home( {userString}: Props ) {
  const user = JSON.parse(userString)
  return (
    <Layout pageTitle="Home">
      <div id="content">
        <h1>Dashboard</h1>
        <p>{user.username}</p>
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
          userString: JSON.stringify(user)
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