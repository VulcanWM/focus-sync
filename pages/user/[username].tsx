import Layout from '../../components/layout'
import { get_user, get_updates } from '@/lib/database'
import { GetServerSidePropsContext } from 'next'
import styles from '@/styles/profile.module.css'
import { useRouter } from 'next/router';

type Props = {
    userString: string,
    updatesString: string
};

type UpdateType = {
    tasks: {
      [task: string]: number;  
    },
    day: number,
    _id: string
}

export default function UserPage( { userString, updatesString}:Props ) {
  const router = useRouter();

  const user = JSON.parse(userString)
  const updates = JSON.parse(updatesString)
  
  return (
    <Layout pageTitle={`${user.username}'s profile`}>
      <div id="content">
        <h2 className={styles.user_heading}><img className={styles.house} alt={`${user.house} logo`} src={`/${user.house}.png`}/> {user.username}</h2>
        <div className={styles.goal}>
            <h3>Goal:</h3>
            <p>{user.goal}</p>
        </div>
        { 
            updates.map((update: UpdateType, index: number) => ( 
                <div style={{cursor: "pointer"}} onClick={() => (router.push(`/update/${update._id}`))} className={styles.update}>
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
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
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
            updatesString: JSON.stringify(updates)
        },
    }
}