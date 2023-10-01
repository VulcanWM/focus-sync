import Layout from '../../components/layout'
import { get_update } from '@/lib/database'
import { GetServerSidePropsContext } from 'next'
import styles from '@/styles/update_page.module.css'
import Link from 'next/link'

type Props = {
    updateString: string
};

export default function Home( { updateString}:Props ) {
  const update = JSON.parse(updateString)
  
  return (
    <Layout pageTitle={`${update.username} day ${update.day} update`}>
      <div id="content">
        <h2 className={styles.user_heading}><img className={styles.house} alt={`${update.house} logo`} src={`/${update.house}.png`}/> <Link href={`/user/${update.username}`}>{update.username}</Link> day {update.day}</h2>
        <p>{update.date.split("T")[0]}</p>
        <p>Productivity Rating: <strong>{update.rating as string}</strong></p>
        <div className={styles.update}>
            { 
                Object.keys(update.tasks).map((task: string, index:number) => ( 
                    <>
                        <p className={styles.name}>✓ {task}</p>
                        <p className={`${styles.time} ${styles[update.house]}`}>{update.tasks[task]} mins</p>
                    </>
                ))
            }
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const id = (context!.params!.id as string).toLowerCase()
    const update = await get_update(id)

    if (update == false){
        return {
            redirect: {
              destination: '/',
              permanent: false,
            },
        }
    }
    return {
        props: {
            updateString: JSON.stringify(update)
        },
    }
}