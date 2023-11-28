import { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import ApiError from '../errors/ApiError'
import User from '../models/userSchema'
import { dev } from '../config/server'
import { handleSendEmail } from '../helper/sendEmail'

//GET-> get all users
export const getAllUsersService = async (page: number, limit: number) => {
  const count = await User.countDocuments()
  if (count <= 0) {
    throw new ApiError(404, 'There are no user yet to show.')
  }
  const totalPage = Math.ceil(count / limit)
  if (page > totalPage) {
    page = totalPage
  }
  const skip = (page - 1) * limit
  const users = await User.find().skip(skip).limit(limit)
  return {
    users,
    totalPage,
    currentPage: page,
  }
}

//GET-> get user by id
export const getSingleUserService = async (req: Request) => {
  const { id } = req.params
  const users = await User.findOne({ id: id })
  if (!users) {
    const error = new ApiError(404, `User with this id does not exist.`)
    throw error
  }
  return users
}

// Check if user already exists
export const isUserExistService = async (req: Request) => {
  const { email } = req.body
  const user = await User.exists({ email: email })
  if (user) {
    const error = new ApiError(409, 'User with this email already exists.')
    throw error
  }
}

//create a new user
export const createUserService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await isUserExistService(req)
    const { name, email, password, phone } = req.body
    const imagePath = req.file?.path

    //protect the password
    const hashedPassword = await bcrypt.hash(password, 10)
    const tokenPayload = {
      name: name,
      email: email,
      password: hashedPassword,
      phone: phone,
      image: imagePath,
    }

    //create the token
    const token = jwt.sign(tokenPayload, dev.app.jwtUserActivationkey, {
      expiresIn: '5m',
    })

    //send an email -> activiate the user (token) inside the email -> click verfied
    const emailData = {
      email: email,
      subject: 'Activate your account',
      html: `<h1> Hello ${name} </h1>

    <p> Please activate your account by
    <a href= "http://localhost:8080/users/activate/${token}"> clicking on this link </a> </p>`,
    }

    //send the email
    await handleSendEmail(emailData);


    res.status(200).json({
      message: 'check your email adress to activate your account',
      token: token,
    });
  } catch (error) {
    next(error);
  }
}

//delete user
export const deleteUserSevice = async (req: Request) => {
  const { id } = req.params
  const user = await User.findOneAndDelete({ id: id })
  if (!user) {
    const error = new ApiError(404, "User with this id doesn't exist")
    throw error
  }
}

//update user
export const updateUserService = async (req: Request) => {
  const { id } = req.params
  const newData = req.body
  const user = await User.findOneAndUpdate({ id: id }, newData, { new: true })
  if (!user) {
    const error = new ApiError(404, "User with this id doesn't exist")
    throw error
  }
  return user
}
