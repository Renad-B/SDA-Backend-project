import { NextFunction, Request, Response } from 'express'

import {
  createSingleCategory,
  deleteCategory,
  getCategory,
  getCategoryBySlug,
  updateSingleCategory,
} from '../services/categoryServices'

export const getAllCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //the service for get all the category
    const category = await getCategory()
    res.status(200).json({
      message: 'all category are returned',
      payload: category,
    })
  } catch (error) {
    next(error)
  }
}

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body
    //services for create single product
    const category = await createSingleCategory(name)
    res.status(201).json({
      message: 'single category created.',
      payload: category,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteSingleCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params
    //service for delete single category
    await deleteCategory(slug)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}
export const getSingleCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params
    //services
    const category = await getCategoryBySlug(slug)
    res.status(200).json({
      message: 'Single category returned',
      paylaod: category,
    })
  } catch (error) {
    next(error)
  }
}

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params
    //services
    const category = await updateSingleCategory(slug, req)
    res.status(200).json({
      message: 'Single category updated',
      payload: category,
    })
  } catch (error) {
    next(error)
  }
}
