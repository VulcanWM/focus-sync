import Layout from '../../components/layout'
import { get_user, get_updates } from '@/lib/database'
import { GetServerSidePropsContext } from 'next'
import styles from '@/styles/profile.module.css'

type Props = {
    userString: string,
    updatesString: string
};

type UpdateType = {
    tasks: {
      [task: string]: number;  
    },
    day: number
}

export default function Home( { userString, updatesString}:Props ) {
  const user = JSON.parse(userString)
  const updates = JSON.parse(updatesString)
  
  return (
    <Layout pageTitle={`${user.username}'s profile`}>
      <div id="content">
        <h2>{user.username}</h2>
        <div className={styles.goal}>
            <h3>Goal:</h3>
            <p>{user.goal}</p>
        </div>
        { 
            updates.map((update: UpdateType, index: number) => ( 
                <div className={styles.update}>
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