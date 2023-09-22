import Layout from '@/components/layout';
import styles from '@/styles/update.module.css'
import {useState} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'

interface Tasks {
    [key: string]: number; 
  }

export default function Home() {
    const [tasks, setTasks] = useState<Tasks>({})
    const [taskName, setTaskName] = useState("")
    const [taskTime, setTaskTime] = useState(5)
    const [msg, setMsg] = useState("Only include tasks relevant to your goal")

    function createTask(){
        if (taskName == ""){setMsg("Give a name to your task");return}
        if (Object.keys(tasks).includes(taskName)){setMsg("This task already exists");return}
        if (Object.keys(tasks).length == 10){setMsg("You can add a maximum of 10 tasks");return}
        if (taskTime<=0){setMsg("The task time has to be greater than 0");return}
        setTasks(tasks => ({
            ...tasks,
            ...{[taskName]: taskTime}
        }));
        setMsg("Only include tasks relevant to your goal")
    }

    function deleteTask(task: string){
        const newTasks = {...tasks}; 
        console.log(newTasks)
        delete (newTasks[task])
        console.log(newTasks)
        setTasks(newTasks)
    }

    return (
        <Layout pageTitle="Home">
            <div id="content">
                <h2>Daily Update</h2>
                <p>{msg}</p>
                <input className={styles.input} value={taskName} placeholder="productive task" type="text" onChange={e => setTaskName(e.target.value)}></input>
                <input className={styles.input} value={taskTime} placeholder="time taken" type="number" onChange={e => setTaskTime(parseFloat(e.target.value))}></input>
                <button className={styles.button} onClick={createTask}>create task</button>
                { 
                    Object.keys(tasks).map((task) => ( 
                        <>
                            <p className={styles.name}> ✓ {task} <FontAwesomeIcon onClick={() => deleteTask(task)} icon={faTrashCan} style={{width: "0.8rem", height: "0.8rem", cursor:"pointer"}}/></p>
                            <p className={styles.time}>{tasks[task as keyof Tasks]} mins</p>
                        </>
                    ))
                }
            </div>
        </Layout>
  )
}