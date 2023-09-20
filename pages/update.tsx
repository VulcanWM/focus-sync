import Layout from '@/components/layout';
import styles from '@/styles/update.module.css'
import {useState} from 'react'

interface Tasks {
    [key: string]: number; 
  }

export default function Home() {
    const [tasks, setTasks] = useState<Tasks>({})
    const [taskName, setTaskName] = useState("")
    const [taskTime, setTaskTime] = useState(0)

    function createTask(){
        if (Object.keys(tasks).includes(taskName)){return}
        if (Object.keys(tasks).length == 10){return}
        setTasks(tasks => ({
            ...tasks,
            ...{[taskName]: taskTime}
          }));
    }

    return (
        <Layout pageTitle="Home">
            <div id="content">
                <h2>Daily Update</h2>
                <input className={styles.input} value={taskName} placeholder="productive task" type="text" onChange={e => setTaskName(e.target.value)}></input>
                <input className={styles.input} value={taskTime} placeholder="time taken" type="number" onChange={e => setTaskTime(parseFloat(e.target.value))}></input>
                <button className={styles.button} onClick={createTask}>create task</button>
                { 
                    Object.keys(tasks).map((task, index) => ( 
                        <>
                            <p className={styles.name}> ✓ {task}</p>
                            <p className={styles.time}>{tasks[task as keyof Tasks]} mins</p>
                        </>
                    ))
                }
            </div>
        </Layout>
  )
}