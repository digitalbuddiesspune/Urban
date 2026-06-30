import asyncHandler from '../utils/asyncHandler.js'
import Category from '../models/Category.js'

const slugify = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// @desc Create category (admin)
// @route POST /api/categories
export const createCategory = asyncHandler(async (req, res) => {
  const { name, image, description } = req.body
  if (!name) {
    res.status(400)
    throw new Error('Category name is required')
  }
  const category = await Category.create({
    name,
    slug: slugify(name),
    image,
    description,
  })
  res.status(201).json({ success: true, category })
})

// @desc Get all categories
// @route GET /api/categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('name')
  res.json({ success: true, count: categories.length, categories })
})

// @desc Update category (admin)
// @route PUT /api/categories/:id
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) {
    res.status(404)
    throw new Error('Category not found')
  }
  if (req.body.name) {
    category.name = req.body.name
    category.slug = slugify(req.body.name)
  }
  if (req.body.image !== undefined) category.image = req.body.image
  if (req.body.description !== undefined) category.description = req.body.description
  if (req.body.isActive !== undefined) category.isActive = req.body.isActive

  const updated = await category.save()
  res.json({ success: true, category: updated })
})

// @desc Delete category (admin)
// @route DELETE /api/categories/:id
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) {
    res.status(404)
    throw new Error('Category not found')
  }
  await category.deleteOne()
  res.json({ success: true, message: 'Category deleted' })
})
