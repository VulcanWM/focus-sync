import styles from '@/styles/index.module.css'
import { useRouter } from 'next/router';
import Layout from '@/components/layout';
import { useState, useEffect } from 'react';

interface IDot {
  top: string;
  left: string; 
  width: string;
}

export default function Home() {
  const router = useRouter();

  const redirectToJoin = () => {
    router.push('/create-account');
  };

  const [dots, setDots] = useState<IDot[]>([...Array(20)].map(() => ({
    top: Math.random() * 100 + '%',
    left: Math.random() * 100 + '%',
    width: (Math.random() * 10 + 5) + 'px'
   })));

  const dotElements = dots.map((dot, i) => {   
    return (
      <div   
        key={i}       
        className={styles.dot}     
        style={{    
          top: dot.top,      
          left: dot.left,      
          width: dot.width,
          height: dot.width    
        }}   
      />    
    )    
   })

  useEffect(() => {
    const interval = setInterval(() => {
      setDots([...Array(20)].map(() => ({      
        top: Math.random() * 100 + '%',
        left: Math.random() * 100 + '%',
        width: (Math.random() * 10 + 5) + 'px'
      })));
    }, 3000);  
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout pageTitle="Home">
      {dotElements}
      <div id="middle">
        <h1 className={styles.title}>FocusSync</h1>
        {/* <p className={styles.caption}>community driven productivity website that makes achieving your goals social and fun</p> */}
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