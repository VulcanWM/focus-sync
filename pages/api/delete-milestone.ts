import type { NextApiRequest, NextApiResponse } from 'next'
import { delete_milestone, get_user_from_email } from '@/lib/database';
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
    const name = req.body.name as string;
    const user = await get_user_from_email(session!.user!.email as string);
    const username = user.username;
    const func = await delete_milestone(name, username)
    if (func == true){
      res.status(200).json({ message: 'Deleted!', error: false })
    } else {
      res.status(200).json({ message: func, error: true })
    }
  } else {
    res.status(200).json({ message: "Login first!", error: true })
  }
}
