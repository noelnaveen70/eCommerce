const Product = require('../model/productModel');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/products';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  // Accept only jpg/jpeg files
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(new Error('Only JPG/JPEG image files are allowed'), false);
  }
};

// Configure multer upload
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Middleware to handle single file upload
exports.uploadProductImage = upload.single('image');

// Get all products with filtering, sorting, and pagination
exports.getAllProducts = async (req, res) => {
  try {
    const { 
      category, 
      sort = 'createdAt', 
      order = 'desc', 
      page = 1, 
      limit = 12,
      minPrice,
      maxPrice,
      tag,
      search
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (category) {
      filter.category = category.toLowerCase();
    }
    
    if (tag) {
      filter.tag = tag;
    }
    
    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }
    
    // Search by name or description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Determine sort order
    const sortOptions = {};
    if (sort === 'price-low') {
      sortOptions.price = 1;
    } else if (sort === 'price-high') {
      sortOptions.price = -1;
    } else if (sort === 'bestsellers') {
      sortOptions.averageRating = -1;
    } else {
      sortOptions[sort] = order === 'asc' ? 1 : -1;
    }
    
    // Execute query with pagination
    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('seller', 'name');
    
    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name')
      .populate('ratings.user', 'name');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    // Add seller ID from authenticated user
    req.body.seller = req.user._id;
    
    // If file was uploaded, add the file path to the product data
    if (req.file) {
      req.body.image = req.file.path.replace(/\\/g, '/'); // Normalize path for all OS
    }
    
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if user is the seller or an admin
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this product'
      });
    }
    
    // If file was uploaded, update the image path
    if (req.file) {
      // Delete old image if it exists
      if (product.image && fs.existsSync(product.image)) {
        fs.unlinkSync(product.image);
      }
      req.body.image = req.file.path.replace(/\\/g, '/');
    }
    
    // Update the product
    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if user is the seller or an admin
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this product'
      });
    }
    
    // Delete product image if it exists
    if (product.image && fs.existsSync(product.image)) {
      fs.unlinkSync(product.image);
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// Add/Update product rating and review
exports.addProductRating = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const userId = req.user._id;
    const productId = req.params.id;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if user has already rated this product
    const existingRatingIndex = product.ratings.findIndex(
      r => r.user.toString() === userId.toString()
    );
    
    if (existingRatingIndex !== -1) {
      // Update existing rating
      product.ratings[existingRatingIndex].rating = rating;
      product.ratings[existingRatingIndex].review = review || product.ratings[existingRatingIndex].review;
      product.ratings[existingRatingIndex].date = Date.now();
    } else {
      // Add new rating
      product.ratings.push({
        user: userId,
        rating,
        review,
        date: Date.now()
      });
    }
    
    // Recalculate average rating
    product.calculateAverageRating();
    
    await product.save();
    
    res.status(200).json({
      success: true,
      message: 'Rating added successfully',
      averageRating: product.averageRating,
      ratings: product.ratings
    });
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding rating',
      error: error.message
    });
  }
};

// Get products by seller
exports.getSellerProducts = async (req, res) => {
  try {
    console.log('getSellerProducts called');
    console.log('User in request:', req.user ? `ID: ${req.user._id}, Role: ${req.user.role}` : 'No user in request');
    
    const sellerId = req.params.sellerId || req.user._id;
    console.log('Using seller ID:', sellerId);
    
    const products = await Product.find({ seller: sellerId });
    console.log(`Found ${products.length} products for seller ${sellerId}`);
    
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seller products',
      error: error.message
    });
  }
};

// Get product categories with counts
exports.getProductCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      categories: categories.map(cat => ({
        name: cat._id,
        count: cat.count
      }))
    });
  } catch (error) {
    console.error('Error fetching product categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product categories',
      error: error.message
    });
  }
}; 