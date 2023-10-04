import type { NextApiRequest, NextApiResponse } from 'next'
import { unban_user, get_user_from_email } from '@/lib/database';
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
    const username = req.query.username as string;
    const your_user = await get_user_from_email(session!.user!.email as string);
    const your_username = your_user.username;
    await unban_user(username, your_username)
    res.redirect(`/user/${username}`)
  } else {
    res.redirect("/")
  }
}