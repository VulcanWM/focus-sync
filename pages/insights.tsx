import Layout from '../components/layout'
import { get_updates, get_user_from_email } from '@/lib/database'
import { getServerSession } from "next-auth/next"
import { authOptions } from './api/auth/[...nextauth]'
import { GetServerSidePropsContext } from 'next'
import styles from '@/styles/insights.module.css'

type Props = {
    userString: string,
    updatesString: string
};

type UpdateType = {
    tasks: {
      [task: string]: number;  
    },
    day: number,
    _id: string,
    mood: string,
    rating: number
    date: Date
}

type MainObjectType = {
    [mood: string]: {
        count: number,
        totalRate: number,
        averageRate: number
    }
}

type MainObjectValueType = {
  count: number,
  totalRate: number,
  averageRate: number
}

export default function UserPage( { userString, updatesString}:Props ) {
  const user = JSON.parse(userString)
  const updates: UpdateType[] = JSON.parse(updatesString)
  if (updates.length == 0){
    
  }

  const calculateCorrelation = (data: UpdateType[]) => {
    const correlation: MainObjectType = {};
    for (const day in data) {
      const mood = data[day].mood;
      const rate = data[day].rating;
      if (mood !== "No") {
        if (!correlation[mood]) {
          correlation[mood] = {
            count: 0,
            totalRate: 0,
            averageRate: 0
          };
        }
        correlation[mood].count++;
        correlation[mood].totalRate += rate;
      }
    }
    for (const mood in correlation) {
      correlation[mood].averageRate = correlation[mood].totalRate / correlation[mood].count;
    }
    return correlation;
  };
  
  const getMostProductiveDays = (data: UpdateType[]) => {
    const productiveDays: MainObjectType = {};
    for (const day in data) {
      const rate = data[day].rating;
      const date = new Date(data[day].date);
      const dayOfWeek = date.toLocaleString('en-us', { weekday: 'long'})
      if (!productiveDays[dayOfWeek]) {
        productiveDays[dayOfWeek] = {
          count: 0,
          totalRate: 0,
          averageRate: 0
        };
      }
      productiveDays[dayOfWeek].count++;
      productiveDays[dayOfWeek].totalRate += rate;
    }
    for (const day in productiveDays) {
      productiveDays[day].averageRate = productiveDays[day].totalRate / productiveDays[day].count;
    }
    return productiveDays;
  };
  
  function round(num: number){
    return Math.round((num + Number.EPSILON) * 100) / 100
  }

  function findMinMaxAverage(array: MainObjectValueType[]) {
    let min: number = array[0].averageRate;  
    let max: number = array[0].averageRate;

    for(let i = 0; i < array.length; i++) {
      if(array[i].averageRate < min) {
         min = array[i].averageRate;  
      }
      if(array[i].averageRate > max) {
         max = array[i].averageRate;   
      }
    }

    return {
      min, 
      max
    }
  }

  const correlation = calculateCorrelation(updates);
  const sortedMoodProductivity = Object.keys(correlation).sort((a, b) => correlation[b].averageRate - correlation[a].averageRate);
  const { min: minValueMood, max: maxValueMood } = findMinMaxAverage(Object.values(correlation));

  const mostProductiveDays = getMostProductiveDays(updates);
  const sortedProductiveDays = Object.keys(mostProductiveDays).sort((a, b) => mostProductiveDays[b].averageRate - mostProductiveDays[a].averageRate);
  const { min: minValueDay, max: maxValueDay } = findMinMaxAverage(Object.values(mostProductiveDays));

  return (
    <Layout pageTitle={`${user.username}'s profile`}>
        <div id="textCenter">
            <h2>Your Insights</h2>
            <h3>Moods</h3>
            <div className={styles.flexParent}>
              { 
                sortedMoodProductivity.map((mood: string) => ( 
                    <div className={`${styles.flexChild} ${correlation[mood].averageRate === maxValueMood ? (styles.best) : ''} ${correlation[mood].averageRate === minValueMood ? (styles.worst) : ''}`} key={mood + " mood"}>
                        <p><strong>{mood}</strong></p>
                        <p>Average Productivity Rate: {round(correlation[mood].averageRate)}</p>
                    </div>
                ))
              }
            </div>
            <h3>Days</h3>
            <div className={styles.flexParent}>
              { 
                sortedProductiveDays.map((day:string) => ( 
                    <div className={`${styles.flexChild} ${mostProductiveDays[day].averageRate === maxValueDay ? (styles.best) : ''} ${mostProductiveDays[day].averageRate === minValueDay ? (styles.worst) : ''}`} key={day + " day"}>
                        <p><strong>{day}</strong></p>
                        <p>Average Productivity Rate: {round(mostProductiveDays[day].averageRate)}</p>
                    </div>
                ))
              }
            </div>
        </div>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    )

    if (session){
        const email = session!.user!.email as string;
        const user = await get_user_from_email(email)
        if (user == false){
            return {
                redirect: {
                  destination: '/',
                  permanent: false,
                },
            }
        } else {
            const updates = await get_updates(user.username)
            return {
                props: {
                    userString: JSON.stringify(user),
                    updatesString: JSON.stringify(updates)
                },
            }
        }
    } else {
        return {
            redirect: {
              destination: '/',
              permanent: false,
            },
        }
    }
}