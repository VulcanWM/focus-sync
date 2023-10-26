import Layout from '../components/layout'
import { get_user_from_email, get_updates } from '../lib/database'
import { GetServerSidePropsContext } from 'next'
import { authOptions } from './api/auth/[...nextauth]'
import { getServerSession } from "next-auth/next"
import styles from '@/styles/stats.module.css'
import Link from 'next/link'

type Props = {
    userString: string,
    updatesString: string
};

type MonthsType = {
    [key: string]: number; 
}

type StringNumberDictType = {
    [key: string]: number
}

const months: MonthsType = {"January": 31, "February": 30, "March": 31, "April": 30, "May": 31, "June": 30, "July": 31, "August": 31, "September": 30, "October": 31, "November": 30, "December": 31}
const days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const allBadges: number[] = [1, 2, 5, 10, 20, 30, 50, 75, 100, 150, 200]

function getMonths(firstMonth: string, firstYear: number, lastMonth: string, lastYear: number) {
    var currentDate = firstMonth + " " + String(firstYear)
    var currentMonth = firstMonth;
    var currentYear = firstYear
    const dates: [string] = [currentDate];
    var lastDate = lastMonth + " " + String(lastYear)
    while (currentDate != lastDate){
      let monthIndex = Object.keys(months).indexOf(currentMonth);
      if (monthIndex == 11){
        monthIndex = 0;
        currentYear += 1
      } else {
        monthIndex += 1;
      }
      currentMonth = Object.keys(months)[monthIndex]
      currentDate = currentMonth + " " + String(currentYear)
      dates.push(currentDate)
    }
    return dates;
}

export default function Home( { userString, updatesString}:Props ) {
  const user = JSON.parse(userString)
  const updates = JSON.parse(updatesString)

  const scores: StringNumberDictType = {}
  const taskNumbers: StringNumberDictType = {}
  const dayNumbers: StringNumberDictType = {}
  var allMonths: string[] = []

  if (updates.length > 0){
    const lastMonth = Object.keys(months)[new Date(updates[0].date).getMonth()]
    const lastYear = new Date(updates[0].date).getFullYear()
    const firstMonth = Object.keys(months)[new Date(updates[updates.length - 1].date).getMonth()]
    const firstYear = new Date(updates[updates.length - 1].date).getFullYear()
    allMonths = getMonths(firstMonth, firstYear, lastMonth, lastYear)
    // allMonths.push("November 2023")

    for (let update of updates){
        let year = String(update.date).split("-")[0]
        let month = Object.keys(months)[parseInt(String(update.date).split("-")[1]) - 1]
        let day = String(update.date).split("-")[2].split("T")[0]
        if (day.startsWith("0")){
            day = day.substring(1)
        }
        scores[`${day} ${month} ${year}`] = update.rating;
        taskNumbers[`${day} ${month} ${year}`] = Object.keys(update.tasks).length;
        dayNumbers[`${day} ${month} ${year}`] = update.day
    }
  }
  
  return (
    <Layout pageTitle={`User Stats`}>
      <div>
        <h1 className={styles.textCenter}>Your User Stats</h1>
        {allMonths.length == 0 &&
            <p className={styles.textCenter}>Submit an update to see your stats page come to life!</p>
        }
        <div className={styles.calendars}>
            {
                allMonths.map((monthYear: string, index: number) => ( 
                    <>
                        <div className={styles.caption}>
                            <h4>{monthYear}</h4>
                        </div>
                        <div className={styles.calendar}>
                            {
                                days.map((day: string, index: number) => ( 
                                    <div className={styles.day}>{day.slice(0, 2)}</div>
                                ))
                            }
                            {
                                Array.from(Array(days.indexOf(new Date(`${monthYear.split(" ")[1]}-${Object.keys(months).indexOf(monthYear.split(" ")[0])+1}-01`).toLocaleString('en-us', {weekday:'long'}))).keys()).map((index: number) => ( 
                                    <div className={styles.day}></div>
                                ))
                            }
                            {
                                Array.from(Array(31).keys()).map((index: number) => ( 
                                    <div className={styles.date + " " + styles["score" + scores[String(index + 1) + " " + monthYear]]}>
                                        <Link className={styles.noLinkStyling} href={`/update/${user.username}:${dayNumbers[String(index + 1) + " " + monthYear]}`}>{index + 1}</Link>
                                        <span className={styles.taskNumber}>{taskNumbers[String(index + 1) + " " + monthYear] || 0}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </>
                    
                ))
            }
        </div>
        <h2 className={styles.textCenter}>Badges</h2>
        {allMonths.length == 0 ?
            <p className={styles.textCenter}>Submit an update to see your earn your first badge!</p>
        :   <p className={styles.textCenter}>These badges are for the number of days you've submitted an update!</p>
        }
        <div className={styles.badges}>
            {
                allBadges.map((number: number, index: number) => ( 
                    <>
                        {updates.length >= number ?
                            <div className={styles.badge + " " + styles[user.house]} id={String(index)}>
                                <p>{number}</p>
                            </div>
                        : 
                            <div className={styles.badge} id={String(index)}>
                                <p>{number}</p>
                            </div>
                        }
                    </>
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