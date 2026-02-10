const Category = require("../models/category.model")
const slugify = require("slugify")


const createCategory = async (req, res) => {
    try {
        const { name } = req.body

        if (!name) {
            return res.status(400).json({ message: "Category name is required" })
        }

        const existing = await Category.findOne({
            name,
            createdBy: req.user._id,
        })

        if (existing) {
            return res.status(409).json({ message: "Category already exists" })
        }

        const category = await Category.create({
            name,
            slug: slugify(name, { lower: true }),
            createdBy: req.user._id,
        })

        res.status(201).json({
            success: true,
            message: "Category created",
            data: category,
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


const getUserCategories = async (req, res) => {
    try {
        const categories = await Category.find({
            createdBy: req.user._id,
            isActive: true,
        }).sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            data: categories,
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findOne({
            _id: req.params.id,
            createdBy: req.user._id, // ownership check
        })

        if (!category) {
            return res.status(404).json({ message: "Category not found" })
        }

        await category.deleteOne()

        res.status(200).json({
            success: true,
            message: "Category deleted",
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


module.exports = { deleteCategory, createCategory, getUserCategories }