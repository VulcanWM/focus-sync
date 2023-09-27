import type { NextApiRequest, NextApiResponse } from 'next'
import { create_user } from '@/lib/database';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session = await getServerSession(req, res, authOptions)
  if (session) {
    const email = session!.user!.email as string;
    const house = req.body.house as string;
    const username = req.body.username as string;
    const goal = req.body.goal as string;
    const func = await create_user(username, email, goal, house)
    if (func == true){
      res.redirect("/dashboard")
    } else {
      res.redirect(`/create-account?error=${func}`)
    }
  } else {
    res.redirect("/create-account")
  }
}
