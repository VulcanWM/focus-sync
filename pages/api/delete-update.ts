import type { NextApiRequest, NextApiResponse } from 'next'
import { delete_update, get_user_from_email } from '@/lib/database';
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
    const update_id = req.body.update_id as string;
    const your_user = await get_user_from_email(session!.user!.email as string);
    const your_username = your_user.username;
    const func = await delete_update(update_id, your_username)
    if (func == true){
      res.status(200).json({ message: 'Deleted!', error: false })
    } else {
      res.status(200).json({ message: func, error: true })
    }
  } else {
    res.status(200).json({ message: "Login first!", error: true })
  }
}
