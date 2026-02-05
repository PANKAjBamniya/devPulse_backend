const express = require("express")
const { protect } = require("../middlewares/auth.middleware")
const { createCategory, getUserCategories, deleteCategory } = require("../controller/category.controller")
const router = express.Router()


router.get("/", protect, getUserCategories)
router.post("/", protect, createCategory)
router.delete("/:id", protect, deleteCategory)

module.exports = router
