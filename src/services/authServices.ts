import { Request, Response } from 'express'
import JWT from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import { createHttpError } from '../errors/createError'
import User from '../models/userSchema'
import { dev } from '../config/server'

export const handleLoginService = async (req: Request, res: Response) => {
  const { email, password } = req.body
  const user = await User.findOne({ email: email })

  if (!user) {
    throw createHttpError(404, 'Invalid email or password')
  }
const isPasswordMatch =bcrypt.compareSync(password,user.password)
if(!isPasswordMatch){
  throw createHttpError(404,'invalid password')
}
  if (user.isBanned) {
    throw createHttpError(401, 'User is banned')
  }

  const accessToken = JWT.sign({ _id: user._id }, String(dev.app.ACCESS_TOKEN_SECRET), {
    expiresIn: '1h',
  })

  res.cookie('access_token', accessToken, {
    maxAge: 15 * 60 * 1000, // 15 minutes
    httpOnly: true,
    sameSite: 'none',
    secure: true
  })

  return user
}
