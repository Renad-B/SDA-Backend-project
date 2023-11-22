import { Router } from "express";
import { createCategory, deleteSingleCategory, getAllCategory, getSingleCategory, updateCategory } from "../controllers/categoryController";

const router=Router();
//GE->/api/categories->for get all the category
router.get('/',getAllCategory);
//GET->/api/categories/slug->for get single category
router.get('/:slug',getSingleCategory);
//POST->/api/categorie-> for create the category
router.post('/',createCategory);
//DELETE ->/api/categories/slug->to delete category
router.delete('/:slug',deleteSingleCategory);
//PUT ->/api/categories/slug->to update the single product
router.put('/:slug',updateCategory)
export default router
