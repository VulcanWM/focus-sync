import styles from '@/styles/create-account.module.css'
import Layout from '@/components/layout';
import { useSession, signIn, signOut } from "next-auth/react"
import { Session } from 'next-auth'

export default function CreateAccount() {
  const { data: session }: {
    data: Session | null
  } = useSession()
  return (
    <Layout pageTitle="Home">
      <div id="content">
        <h2 className={styles.small_title}>create account</h2>
        {session ? 
          <>
            <p className={styles.email}>{session!.user!.email}</p>
            <input placeholder="username" className={styles.signup_input} required></input><br/>
            <textarea className={styles.signup_textarea} defaultValue="your goal..." required></textarea><br/><br/>
            <ul className={styles.houses}>
              <li className={styles.verdant}>
                <input type="radio" id="verdant" name="house" />
                <label htmlFor="verdant">Verdant</label>
              </li>
              <li className={styles.lumos}>
                <input type="radio" id="lumos" name="house" />
                <label htmlFor="lumos">Lumos</label>
              </li>
              <li className={styles.erythro}>
                <input type="radio" id="erythro" name="house"/>
                <label htmlFor="erythro">Erythro</label>
              </li>
              <li className={styles.azurite}>
                <input type="radio" id="azurite" name="house" />
                <label htmlFor="azurite">Azurite</label>
              </li>
            </ul>
            <button className={styles.signup_button}>create account</button>
          </>
        :
          <>
            <button className={styles.signup_button} onClick={() => signIn()}>sign in with oauth</button>
          </>
        }
      </div>
    </Layout>
  )
}