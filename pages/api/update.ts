import type { NextApiRequest, NextApiResponse } from 'next'
import { create_update, get_user_from_email } from '@/lib/database';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"

type Data = {
  message: string,
  error: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session = await getServerSession(req, res, authOptions)
  if (session) {
    const rating = req.body.rating as number;
    const tasks = req.body.tasks as object;
    const date = req.body.date as Date
    const user = await get_user_from_email(session!.user!.email as string);
    const username = user.username;
    const func = await create_update(username, date, rating, tasks)
    if (func == true){
      res.status(200).json({ message: 'Created!', error: false })
    } else {
      res.status(200).json({ message: func, error: true })
    }
  } else {
    res.status(200).json({ message: "Login first!", error: true })
  }
}
