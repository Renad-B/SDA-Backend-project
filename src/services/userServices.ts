import { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcrypt'

import ApiError from '../errors/ApiError'
import User from '../models/userSchema'
import { handleSendEmail } from '../helper/sendEmail'
import { createHttpError } from '../errors/createError'
import generateToken from '../util/generateToken'
import { userType } from '../types'

//GET-> get all users
export const getAllUsersService = async (page: number, limit: number, req: Request) => {
  const count = await User.countDocuments()
  if (count <= 0) {
    throw createHttpError(404, 'There are no user yet to show.')
  }
  const totalPage = Math.ceil(count / limit)

  if (page > totalPage) {
    page = totalPage
  }
  const skip = (page - 1) * limit
  const { search } = req.query
  let filter = {}
  if (search) {
    const searchRegExp = new RegExp('.*' + search + '.*', 'i')

    filter = {
      isAdmin: { $ne: true },
      $or: [
        { name: { $regex: searchRegExp } },
        { email: { $regex: searchRegExp } },
        { phone: { $regex: searchRegExp } },
      ],
    }
  }
  const options = {
    password: 0,
    __v: 0,
  }

  const users = await User.find(filter, options).sort({ name: 1 }).skip(skip).limit(limit)
  return {
    users,
    totalPage,
    currentPage: page,
  }
}

//GET-> get user by id
export const getSingleUserService = async (id: string) => {
  const options = {
    password: 0,
    __v: 0,
  }
  const users = await User.findOne({ _id: id },options)
  if (!users) {
    const error = new ApiError(404, `User with this id:${id} does not exist.`)
    throw error
  }
  return users
}

// Check if user already exists
export const isUserExistService = async (email: string) => {
  const user = await User.exists({ email: email })
  if (user) {
    const error = new ApiError(409, 'User with this email already exists.')
    throw error
  }
}

//create a new user
export const createUserService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phone } = req.body
    await isUserExistService(email)
    const imagePath = req.file?.path

    //protect the password
    const hashedPassword = await bcrypt.hash(password, 10)
    const tokenPayload: userType = {
      name: name,
      email: email,
      password: hashedPassword,
      phone: phone,
    }
    if (imagePath) {
      tokenPayload.image = imagePath
    }

    // create the token using the utility function
    const token = generateToken(tokenPayload)

    //send an email -> activiate the user (token) inside the email -> click verfied
    const emailData = {
      email: email,
      subject: 'Activate your account',
      html: `<h1> Hello ${name} </h1>

    <p> Please activate your account by
    <a href= "http://localhost:8080/users/activate/${token}"> clicking on this link </a> </p>`,
    }

    //send the email
    await handleSendEmail(emailData)

    res.status(200).json({
      message: 'check your email adress to activate your account',
      token: token,
    })
  } catch (error) {
    next(error)
  }
}

//delete user
export const deleteUserSevice = async (id: string) => {
  const user = await User.findOneAndDelete({ _id: id })
  if (!user) {
    const error = new ApiError(404, "User with this id doesn't exist")
    throw error
  }
}

//update user
export const updateUserService = async (id: string, req: Request) => {
  const newData = req.body
  const user = await User.findOneAndUpdate({ _id: id }, newData, { new: true })
  if (!user) {
    const error = new ApiError(404, "User with this id doesn't exist")
    throw error
  }
  return user
}
//ban user
export const banUserById = async (id: string) => {
  const user = await User.findByIdAndUpdate({ _id: id }, { isBanned: true })
  if (!user) {
    const error = createHttpError(404, `user is not found with this id: ${id}`)
    throw error
  }
}
//unban user
export const unbanUserById = async (id: string) => {
  const user = await User.findByIdAndUpdate({ _id: id }, { isBanned: false })
  if (!user) {
    const error = createHttpError(404, `user is not found with this id: ${id}`)
    throw error
  }
}
