import type { NextApiRequest, NextApiResponse } from 'next'
import { get_latest_updates_after } from '@/lib/database';
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"

type Data = {
  data: object,
  error: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session = await getServerSession(req, res, authOptions)
  if (session) {
    const dateString = String(req.body.created);
    const date = new Date(dateString)
    const next = await get_latest_updates_after(date)
    res.status(200).json({ data: next, error: false })
  } else {
    res.status(200).json({ data: {}, error: true })
  }
}
