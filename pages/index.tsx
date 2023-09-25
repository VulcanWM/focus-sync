import styles from '@/styles/index.module.css'
import { useRouter } from 'next/router';
import Layout from '@/components/layout';

export default function Home() {
  const router = useRouter();

  const redirectToJoin = () => {
    router.push('/create-account');
  };
  return (
    <Layout pageTitle="Home">
      <div id="content">
        <h1 className={styles.title}>FocusSync</h1>
        <ul>
          <li className={styles.point}>Be accountable: Join a group for days of focus, motivation and discipline.</li>
          <li className={styles.point}>Get support: Encouragement and advice from others walking the same path.</li>
          <li className={styles.point}>Learn faster: Succeed together and grow from each other's experiences.</li>
        </ul>
        <button onClick={redirectToJoin} className={styles.join_button}><span className={styles.join_link}>join us</span></button>
      </div>
    </Layout>
  )
}