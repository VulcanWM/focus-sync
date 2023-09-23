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
        delete (newTasks[task])
        setTasks(newTasks)
    }

    function allowDrop(ev: React.DragEvent<HTMLDivElement>) {
        ev.preventDefault(); 
    }
      
    function drag(ev: React.DragEvent<HTMLDivElement>) {
        ev.dataTransfer!.setData("text", (ev.target as HTMLDivElement).title);
    }
      
    function drop(ev: React.DragEvent<HTMLDivElement>) {
        ev.preventDefault();
        let key1 = ev.dataTransfer!.getData("text");
        const key2 = (ev.target as HTMLDivElement).title;
        console.log(key2)
        
        const keys = Object.keys(tasks);
        const values = Object.values(tasks);
    
        const keyIndex1 = keys.indexOf(key1);
        const keyIndex2 = keys.indexOf(key2);
    
        [keys[keyIndex1], keys[keyIndex2]] = [keys[keyIndex2], keys[keyIndex1]];
        [values[keyIndex1], values[keyIndex2]] = [values[keyIndex2], values[keyIndex1]];
    
        const newTasks: Tasks = {};
        keys.forEach((key, index) => {
          newTasks[key] = values[index]; 
        });
    
        setTasks(newTasks);

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
                        <div title={task} onDrop={(event) => drop(event)} onDragOver={(event) => allowDrop(event)} onDragStart={(event) => drag(event)} draggable={true}>
                            <p title={task} className={styles.name}> ✓ {task} <FontAwesomeIcon onClick={() => deleteTask(task)} icon={faTrashCan} style={{width: "0.8rem", height: "0.8rem", cursor:"pointer", color: "red"}}/></p>
                            <p title={task} className={styles.time}>{tasks[task as keyof Tasks]} mins</p>
                        </div>
                    ))
                }
            </div>
        </Layout>
  )
}