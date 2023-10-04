import Layout from '../../components/layout'
import { get_user, get_updates, get_user_from_email } from '@/lib/database'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../api/auth/[...nextauth]'
import { GetServerSidePropsContext } from 'next'
import styles from '@/styles/profile.module.css'
import { useRouter } from 'next/router';
import { admins } from '@/lib/admins'

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
    _id: string
}

export default function UserPage( { userString, updatesString, admin}:Props ) {
  const router = useRouter();

  const user = JSON.parse(userString)
  const updates = JSON.parse(updatesString)
  return (
    <Layout pageTitle={`${user.username}'s profile`}>
        <div id="content">
            <h2 className={styles.user_heading}><img className={styles.house} alt={`${user.house} logo`} src={`/${user.house}.png`}/> {user.username}</h2>
            {user.banned == false ? 
                <>
                    {admin && <button onClick={() => (router.push(`/api/ban-user?username=${user.username}&reason=for going against the rules`))}>ban user</button>}
                    <div className={styles.goal}>
                        <h3>Goal:</h3>
                        <p>{user.goal}</p>
                    </div>
                    { 
                        updates.map((update: UpdateType, indexUpdate: number) => ( 
                            <div key={indexUpdate} style={{cursor: "pointer"}} onClick={() => (router.push(`/update/${update._id}`))} className={styles.update}>
                                <p>Day {update.day}</p>
                                { 
                                    Object.keys(update.tasks).map((task: string, indexTask:number) => ( 
                                        <div key={indexUpdate + ":" + indexTask}>
                                            <p className={styles.name}>✓ {task}</p>
                                            <p className={`${styles.time} ${styles[user.house]}`}>{update.tasks[task]} mins</p>
                                        </div>
                                    ))
                                }
                            </div>
                        ))
                    }
                </>
            : 
                <>
                    <p>{user.username} is banned <strong>{user.banned}</strong>!</p>
                    {admin && <button onClick={() => (router.push(`/api/unban-user?username=${user.username}`))}>unban user</button>}
                </>
            }
        </div>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    )
    var your_username = "";
    if (session){
        const email = session!.user!.email as string;
        const your_user = await get_user_from_email(email)
        if (your_user != false){
            your_username = your_user.username;
        }
    }
    const admin = admins.includes(your_username)

    const username = (context!.params!.username as string).toLowerCase()
    const user = await get_user(username)

    if (user == false){
        return {
            redirect: {
              destination: '/',
              permanent: false,
            },
        }
    }

    const updates = await get_updates(username)
    return {
        props: {
            userString: JSON.stringify(user),
            updatesString: JSON.stringify(updates),
            admin: admin
        },
    }
}