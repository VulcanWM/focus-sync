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
      <div id="middle">
        <h1 className={styles.title}>FocusSync</h1>
        <p>community driven productivity website that makes achieving your goals social and fun</p>
        <ul>
          <li className={styles.point}>Set a goal</li>
          <li className={styles.point}>Track the time you spend on each task</li>
          <li className={styles.point}>Stay motivated by seeing how others are performing</li>
        </ul>
        <button onClick={redirectToJoin} className={styles.join_button}><span className={styles.join_link}>join us</span></button>
      </div>
    </Layout>
  )
}