import styles from '@/styles/create-account.module.css'
import Layout from '@/components/layout';

export default function Home() {
  return (
    <Layout pageTitle="Home">
      <div id="content">
        <h2 className={styles.small_title}>create account</h2>
        <input placeholder="username" className={styles.signup_input} required></input><br/>
        <textarea className={styles.signup_textarea} required>your goal...</textarea><br/><br/>
        <button className={styles.signup_button}>create account</button>
      </div>
    </Layout>
  )
}