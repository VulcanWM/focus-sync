import type { NextApiRequest, NextApiResponse } from 'next'
import { reopen_milestone, get_user_from_email } from '@/lib/database';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"

type Data = {
  message: string,
  error: boolean,
  data: object
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
    const func = await reopen_milestone(name, username)
    if (typeof func == "object"){
      res.status(200).json({ message: 'Reopened!', error: false, data: func })
    } else {
      res.status(200).json({ message: func, error: true, data: {} })
    }
  } else {
    res.status(200).json({ message: "Login first!", error: true, data: {} })
  }
}