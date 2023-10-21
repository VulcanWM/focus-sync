import Layout from '../../components/layout'
import { get_update, get_user_from_email } from '@/lib/database'
import { GetServerSidePropsContext } from 'next'
import styles from '@/styles/update_page.module.css'
import Link from 'next/link'
import { authOptions } from '../api/auth/[...nextauth]'
import { getServerSession } from "next-auth/next"
import { admins } from '@/lib/admins'
import { useRouter } from 'next/router';
import axios from 'axios'

type Props = {
    updateString: string,
    admin: string,
    your_username: string
};

export default function Home( { updateString, admin, your_username}:Props ) {
  const router = useRouter();
  const update = JSON.parse(updateString)

  async function deleteUpdate(update_id: string){
    const updateData = {
      update_id: update_id
    }
    axios.post(`/api/delete-update`, updateData).then((response) => {
        if (response.data.error == false){
            router.push(`/user/${update.username}`)
        } else {
            console.log("error")
        }
    });
  }
  
  return (
    <Layout pageTitle={`${update.username} day ${update.day} update`}>
      <div id="content">
        <h2 className={styles.user_heading}><img className={styles.house} alt={`${update.house} logo`} src={`/${update.house}.png`}/> <Link href={`/user/${update.username}`}>{update.username}</Link> day {update.day}</h2>
        <p>{update.date.split("T")[0]}</p>
        {((update.username == your_username) || admin)&&<button onClick={() => (deleteUpdate(update._id))}>delete update</button>}
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
            updateString: JSON.stringify(update),
            admin: admin,
            your_username: your_username
        },
    }
}