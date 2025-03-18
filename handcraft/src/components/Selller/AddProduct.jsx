import React, { useState, useRef, useEffect } from "react";
import { 
  FaArrowLeft, 
  FaSave, 
  FaUpload, 
  FaExclamationTriangle,
  FaSpinner,
  FaCheckCircle
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AddProduct.css"; // Import CSS for animations
import axiosInstance from "../../axiosInstance";
import { getAuthToken } from "../../utils/auth";

const AddProduct = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    tag: "",
    stock: 10,
    image: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [snackbar, setSnackbar] = useState({ show: false, message: "", type: "success" });

  // Categories from the product model
  const categories = [
    { value: "art", label: "Art" },
    { value: "clothing", label: "Clothing" },
    { value: "ceramics", label: "Ceramics" },
    { value: "jewellery", label: "Jewellery" },
    { value: "wooden", label: "Wooden" },
    { value: "clay", label: "Clay" },
    { value: "decor", label: "Decor" }
  ];

  // Tags from the product model
  const tags = [
    { value: "", label: "None" },
    { value: "New", label: "New" },
    { value: "Bestseller", label: "Bestseller" },
    { value: "Trending", label: "Trending" },
    { value: "Limited", label: "Limited Edition" }
  ];

  // Show snackbar notification
  const showSnackbar = (message, type = "success") => {
    setSnackbar({ show: true, message, type });
    setTimeout(() => {
      setSnackbar({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Auto-navigate after successful submission
  useEffect(() => {
    let timer;
    if (snackbar.show && snackbar.type === "success") {
      timer = setTimeout(() => {
        navigate("/seller");
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [snackbar, navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert price and stock to numbers
    if (name === "price" || name === "stock") {
      setFormData({
        ...formData,
        [name]: value === "" ? "" : parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrors({
        ...errors,
        image: "Only JPG/JPEG images are allowed"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({
        ...errors,
        image: "Image size should be less than 5MB"
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Update form data
    setFormData({
      ...formData,
      image: file
    });
    
    // Clear error
    if (errors.image) {
      setErrors({
        ...errors,
        image: null
      });
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.price || formData.price <= 0) newErrors.price = "Valid price is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.stock || formData.stock < 0) newErrors.stock = "Valid stock quantity is required";
    if (!formData.image) newErrors.image = "Product image is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Check if user is authenticated
      const token = getAuthToken();
      if (!token) {
        setSubmitError("Authentication required. Please login to add products.");
        setIsSubmitting(false);
        return;
      }
      
      // Create FormData object for file upload
      const productData = new FormData();
      productData.append("name", formData.name);
      productData.append("price", formData.price);
      productData.append("description", formData.description);
      productData.append("category", formData.category);
      productData.append("tag", formData.tag);
      productData.append("stock", formData.stock);
      productData.append("image", formData.image);
      
      // Send data to backend API
      const response = await axiosInstance.post('api/products', productData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Product added successfully:', response.data);
      
      // Show success message
      showSnackbar(`${formData.name} added successfully`);
      
      // Navigation will happen automatically after the snackbar is shown (see useEffect)
      
    } catch (error) {
      console.error("Error adding product:", error);
      setSubmitError(
        error.response?.data?.message || 
        error.message || 
        "Failed to add product. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate("/seller")}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <FaArrowLeft className="text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Add New Product</h1>
        </div>
        
        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start">
              <FaExclamationTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-600 dark:text-red-400">{submitError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
                
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price ($)*
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0.01"
                    step="0.01"
                    className={`w-full px-3 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                  )}
                </div>
                
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category*
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                  )}
                </div>
                
                {/* Tag */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tag
                  </label>
                  <select
                    name="tag"
                    value={formData.tag}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    {tags.map(tag => (
                      <option key={tag.value} value={tag.value}>
                        {tag.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock*
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 border ${errors.stock ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-500">{errors.stock}</p>
                  )}
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Image* (JPG/JPEG only)
                  </label>
                  <div 
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                      errors.image 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/10' 
                        : 'border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-600'
                    } cursor-pointer transition-colors`}
                    onClick={handleUploadClick}
                  >
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Product preview" 
                            className="mx-auto h-64 w-auto object-contain"
                          />
                        </div>
                      ) : (
                        <>
                          <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600 dark:text-gray-400">
                            <p className="pl-1">Click to upload a product image</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            JPG, JPEG up to 5MB
                          </p>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        name="image"
                        accept=".jpg,.jpeg,image/jpeg,image/jpg"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </div>
                  </div>
                  {errors.image && (
                    <p className="mt-1 text-sm text-red-500">{errors.image}</p>
                  )}
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description*
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="8"
                    className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
                    placeholder="Describe your product in detail..."
                  ></textarea>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => navigate("/seller")}
                className="mr-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-70 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Save Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Snackbar */}
      {snackbar.show && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center p-4 rounded-md shadow-lg ${
          snackbar.type === "success" 
            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" 
            : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
        } animate-fade-in-down`}>
          {snackbar.type === "success" ? (
            <FaCheckCircle className="mr-2 text-green-500 dark:text-green-300" />
          ) : (
            <FaExclamationTriangle className="mr-2 text-red-500 dark:text-red-300" />
          )}
          <p className="font-medium">{snackbar.message}</p>
        </div>
      )}
    </div>
  );
};

export default AddProduct; 