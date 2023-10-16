import styles from '@/styles/create-account.module.css'
import Layout from '@/components/layout';
import { signIn} from "next-auth/react"
import { useRouter } from 'next/router';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import { GetServerSidePropsContext } from 'next'
import { get_user_from_email } from '@/lib/database';
import Link from 'next/link';

type Props = {
  email: string;
};

export default function CreateAccount( {email}: Props ) {
  const router = useRouter()
  const { error } = router.query
  return (
    <Layout pageTitle="Create Account">
      <div id="content">
        <h2 className={styles.small_title}>create account</h2>
        <p className={styles.error}>{error}</p>
        {email ? 
          <form action="/api/create-account" method='POST'>
            <p className={styles.email}>{email}</p>
            <input maxLength={20} autoComplete="off" placeholder="username" className={styles.signup_input} name="username" required></input><br/>
            <textarea minLength={20} maxLength={100} className={styles.signup_textarea} placeholder="your goal..." name="goal" required></textarea><br/><br/>
            <p>Houses</p>
            <p className={styles.moreInfo}>Find out more about them on the <Link href="/houses">houses page</Link></p>
            <ul className={styles.houses}>
              <li className={styles.verdant}>
                <input type="radio" id="verdant" name="house" value="verdant" required/>
                <label htmlFor="verdant">Verdant</label>
              </li>
              <li className={styles.lumos}>
                <input type="radio" id="lumos" name="house" value="lumos" required/>
                <label htmlFor="lumos">Lumos</label>
              </li>
              <li className={styles.erythro}>
                <input type="radio" id="erythro" name="house" value="erythro" required/>
                <label htmlFor="erythro">Erythro</label>
              </li>
              <li className={styles.azurite}>
                <input type="radio" id="azurite" name="house" value="azurite" required/>
                <label htmlFor="azurite">Azurite</label>
              </li>
            </ul>
            <button className={styles.signup_button}>create account</button>
          </form>
        :
          <>
            <button className={styles.signup_button} onClick={() => signIn()}>sign in with oauth</button>
          </>
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
  var email: any = false;
  if (session){
    email = session!.user!.email as string;
    if (await get_user_from_email(email) != false){
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      }
    }
  } 
  return {
    props: {
      email: email
    },
  }
}