import type { NextApiRequest, NextApiResponse } from 'next'
import { create_update, get_user_from_email } from '@/lib/database';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"

type Data = {
  message: string,
  error: boolean
}

interface Tasks {
  [task: string]: number;  
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session = await getServerSession(req, res, authOptions)
  if (session) {
    const mood = req.body.mood as string;
    const rating = req.body.rating as number;
    const tasks: Tasks = req.body.tasks;
    const dateString = String(req.body.date);
    const date = new Date(dateString)
    const user = await get_user_from_email(session!.user!.email as string);
    const username = user.username;
    const func = await create_update(username, date, rating, tasks, mood)
    if (func == true){
      res.status(200).json({ message: 'Created!', error: false })
    } else {
      res.status(200).json({ message: func, error: true })
    }
  } else {
    res.status(200).json({ message: "Login first!", error: true })
  }
}
