import styles from '@/styles/houses.module.css'
import Layout from '@/components/layout';

export default function Houses() {
  return (
    <Layout pageTitle="Houses">
      <div>
        <h1 className={styles.title}>The Houses</h1>
        <div className={styles.houses}>
            <div className={styles.verdant + " " + styles.house}>
                <h2>Verdant</h2><br/>
                <span>calmness</span>
                <span>resilience</span>
            </div>
            <div className={styles.lumos + " " + styles.house}>
                <h2>Lumos</h2><br/>
                <span>excitement</span>
                <span>positivity</span>
            </div>
            <div className={styles.erythro + " " + styles.house}>
                <h2>Erythro</h2><br/>
                <span>passion</span>
                <span>strength</span>
            </div>
            <div className={styles.azurite + " " + styles.house}>
                <h2>Azurite</h2><br/>
                <span>curiosity</span>
                <span>intelligence</span>
            </div>
        </div>
      </div>
    </Layout>
  )
}