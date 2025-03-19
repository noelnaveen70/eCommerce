import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaShoppingCart, 
  FaDollarSign, 
  FaClipboardList, 
  FaTruck, 
  FaChartBar, 
  FaBoxOpen,
  FaExclamationTriangle,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaUpload,
  FaImage,
  FaCheckCircle
} from "react-icons/fa";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./AddProduct.css"; // Import CSS for animations
import axiosInstance from "../../axiosInstance";
import { getAuthToken, isAuthenticated } from "../../utils/auth";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalOrders: 0,
    products: [],
    salesGrowth: [],
    recentOrders: [],
    topProducts: [],
    inventoryAlerts: [],
    performanceMetrics: {
      salesGrowth: 0,
      revenueGrowth: 0,
      averageOrderValue: 0,
      conversionRate: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: "",
    price: "",
    category: "",
    subcategory: "",
    tag: "",
    stock: "",
    image: ""
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [snackbar, setSnackbar] = useState({ show: false, message: "", type: "success" });
  // State for tracking selected subcategories
  const [availableSubcategories, setAvailableSubcategories] = useState([]);

  // Show snackbar notification
  const showSnackbar = (message, type = "success") => {
    setSnackbar({ show: true, message, type });
    setTimeout(() => {
      setSnackbar({ show: false, message: "", type: "success" });
    }, 3000);
  };

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    // Debug token retrieval
    const sessionToken = sessionStorage.getItem('token');
    const loginToken = sessionStorage.getItem('logintoken');
    const localToken = localStorage.getItem('token');
    console.log('Session token:', sessionToken ? 'Present' : 'Not found');
    console.log('Login token:', loginToken ? 'Present' : 'Not found');
    console.log('Local storage token:', localToken ? 'Present' : 'Not found');
    
    // Check if user is authenticated using the isAuthenticated utility function
    if (!isAuthenticated()) {
      console.error('No token found in any storage location');
      setError("Authentication required. Please login to view your seller dashboard.");
      setIsLoading(false);
      return;
    }
    
    console.log('Token found, proceeding with data fetch');
    
    // Fetch seller products from API
    const fetchSellerProducts = async () => {
      try {
        console.log('Fetching seller products...');
        const response = await axiosInstance.get('/api/products/seller');
        console.log('Seller products response:', response.data);
        
        if (response.data.success) {
          // Map the API response to our dashboard data structure
          const products = response.data.products.map(product => ({
            id: product._id,
            name: product.name,
            price: product.price,
            category: product.category,
            stock: product.stock || 0,
            sold: product.sold || 0,
            image: product.image,
            inventoryStatus: product.stock > 10 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock"
          }));
          
          // Update dashboard data with real products
          setDashboardData(prevData => ({
            ...prevData,
            products: products,
            // Generate inventory alerts for low stock items
            inventoryAlerts: products
              .filter(p => p.stock <= 5 && p.stock > 0)
              .map(p => ({ 
                product: p.name, 
                message: `Only ${p.stock} items left in stock` 
              }))
              .concat(
                products
                  .filter(p => p.stock === 0)
                  .map(p => ({ 
                    product: p.name, 
                    message: `Out of stock` 
                  }))
              )
          }));
        }
        
        // Still load mock data for other dashboard elements
        const mockData = getMockData(timeRange);
        setDashboardData(prevData => ({
          ...mockData,
          products: prevData.products,
          inventoryAlerts: prevData.inventoryAlerts
        }));
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching seller products:', err);
        
        // More detailed error handling
        let errorMessage = "Failed to load your products. Please try again later.";
        
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response data:', err.response.data);
          console.error('Error response status:', err.response.status);
          
          if (err.response.status === 401) {
            errorMessage = "Authentication failed. Please log in again.";
          } else if (err.response.status === 403) {
            errorMessage = "You don't have permission to view seller products.";
          } else if (err.response.status === 500) {
            errorMessage = "Server error. Please try again later or contact support.";
          }
          
          if (err.response.data && err.response.data.message) {
            errorMessage += ` (${err.response.data.message})`;
          }
        } else if (err.request) {
          // The request was made but no response was received
          console.error('Error request:', err.request);
          errorMessage = "No response from server. Please check your internet connection.";
        }
        
        setError(errorMessage);
        
        // Load mock data for demo purposes even if the API call fails
        const mockData = getMockData(timeRange);
        setDashboardData(mockData);
        
        setIsLoading(false);
      }
    };
    
    fetchSellerProducts();
  }, [timeRange]);

  // Update available subcategories when category changes
  useEffect(() => {
    if (productFormData.category) {
      setAvailableSubcategories(getSubcategories(productFormData.category));
    } else {
      setAvailableSubcategories([]);
    }
  }, [productFormData.category]);

  // Chart data preparation
  const salesGrowthData = {
    labels: dashboardData.salesGrowth.map((entry) => entry.date),
    datasets: [
      {
        label: "Sales Growth",
        data: dashboardData.salesGrowth.map((entry) => entry.sales),
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const productCategoryData = {
    labels: ['Clothing', 'Accessories', 'Home Decor', 'Art', 'Jewelry'],
    datasets: [
      {
        data: [35, 25, 20, 10, 10],
        backgroundColor: [
          '#4F46E5',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6'
        ],
        borderWidth: 0,
      },
    ],
  };

  const topProductsData = {
    labels: dashboardData.topProducts.map(product => product.name),
    datasets: [
      {
        label: 'Units Sold',
        data: dashboardData.topProducts.map(product => product.unitsSold),
        backgroundColor: '#4F46E5',
      },
    ],
  };

  // Filter products based on search term
  const filteredProducts = dashboardData.products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle product form input changes
  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductFormData({
      ...productFormData,
      [name]: name === "price" || name === "stock" ? parseFloat(value) || "" : value
    });
  };

  // Open modal for adding a new product
  const handleAddProduct = () => {
    setCurrentProduct(null);
    setProductFormData({
      name: "",
      price: "",
      category: "",
      subcategory: "",
      tag: "",
      stock: "",
      image: ""
    });
    setShowProductModal(true);
  };

  // Open modal for editing an existing product
  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    
    // Ensure all fields are properly set for editing
    setProductFormData({
      name: product.name || "",
      price: product.price || 0,
      category: product.category || "",
      subcategory: product.subcategory || "",
      tag: product.tag || "",
      stock: product.stock || 0,
      image: product.image || "",
      // Clear any previous image preview
      imagePreview: null
    });
    
    setShowProductModal(true);
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert("Only JPG/JPEG images are allowed");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    // Store the file object directly
    setProductFormData({
      ...productFormData,
      image: file
    });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      // Just update the preview, not the actual image value
      setProductFormData(prev => ({
        ...prev,
        imagePreview: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Define subcategories by category
  const subcategoriesByCategory = {
    art: ["Paintings", "Sculptures", "Folk Art", "Traditional Art", "Contemporary Art"],
    clothing: ["Kurtas", "Sarees", "Dupattas", "Handwoven Fabrics", "Embroidered Apparel"],
    ceramics: ["Pottery", "Vases", "Tableware", "Decorative Items", "Blue Pottery"],
    jewellery: ["Silver Jewellery", "Tribal Jewellery", "Beaded Jewellery", "Traditional Designs", "Contemporary Pieces"],
    wooden: ["Furniture", "Decorative Items", "Kitchen Accessories", "Toys", "Wall Art"],
    clay: ["Terracotta", "Pottery", "Decorative Items", "Functional Items", "Sculptures"],
    decor: ["Wall Hangings", "Home Accessories", "Textiles", "Baskets & Storage", "Seasonal Decor"]
  };

  // Define product tags
  const productTags = [
    { value: "New", label: "New" },
    { value: "Bestseller", label: "Bestseller" },
    { value: "Trending", label: "Trending" },
    { value: "Limited", label: "Limited Edition" }
  ];

  // Helper to get subcategories for the selected category
  const getSubcategories = (category) => {
    if (!category) return [];
    
    // Convert to lowercase for consistency with model
    const normalizedCategory = category.toLowerCase();
    return subcategoriesByCategory[normalizedCategory] || [];
  };

  // Handle product form submission
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!productFormData.name || !productFormData.price || !productFormData.category || 
        !productFormData.subcategory || !productFormData.tag || productFormData.stock === undefined || 
        productFormData.stock === "" || !productFormData.image) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('name', productFormData.name);
      formData.append('price', productFormData.price);
      formData.append('category', productFormData.category);
      formData.append('subcategory', productFormData.subcategory || '');
      formData.append('tag', productFormData.tag || '');
      formData.append('stock', productFormData.stock);
      
      // If image is a File object, append it to formData
      if (productFormData.image instanceof File) {
        formData.append('image', productFormData.image);
      } else if (typeof productFormData.image === 'string' && productFormData.image.startsWith('data:')) {
        // Convert base64 to file
        const res = await fetch(productFormData.image);
        const blob = await res.blob();
        const file = new File([blob], "product-image.jpg", { type: 'image/jpeg' });
        formData.append('image', file);
      }
      
      let response;
      
      if (currentProduct) {
        // Update existing product
        response = await axiosInstance.put(`/api/products/${currentProduct.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data.success) {
          // Update the product in the local state
          const updatedProducts = dashboardData.products.map(p => 
            p.id === currentProduct.id ? { 
              ...p, 
              name: productFormData.name,
              price: productFormData.price,
              category: productFormData.category,
              subcategory: productFormData.subcategory,
              tag: productFormData.tag,
              stock: productFormData.stock,
              image: response.data.product.image || p.image,
              inventoryStatus: productFormData.stock > 10 ? "In Stock" : productFormData.stock > 0 ? "Low Stock" : "Out of Stock"
            } : p
          );
          
          setDashboardData({
            ...dashboardData,
            products: updatedProducts
          });
          
          showSnackbar(`${productFormData.name} updated successfully`);
        }
      } else {
        // Add new product
        response = await axiosInstance.post('/api/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data.success) {
          const newProduct = {
            id: response.data.product._id,
            name: response.data.product.name,
            price: response.data.product.price,
            category: response.data.product.category,
            subcategory: response.data.product.subcategory,
            tag: response.data.product.tag,
            stock: response.data.product.stock || 0,
            sold: 0,
            image: response.data.product.image,
            inventoryStatus: response.data.product.stock > 10 ? "In Stock" : response.data.product.stock > 0 ? "Low Stock" : "Out of Stock"
          };
          
          setDashboardData({
            ...dashboardData,
            products: [...dashboardData.products, newProduct]
          });
          
          showSnackbar(`${newProduct.name} added successfully`);
        }
      }
      
      // Close modal
      setShowProductModal(false);
    } catch (err) {
      console.error('Error saving product:', err);
      showSnackbar(`Failed to save product: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle product deletion
  const handleDeleteProduct = (product) => {
    setDeleteConfirmation(product);
  };

  // Confirm product deletion
  const confirmDeleteProduct = async () => {
    try {
      setIsLoading(true);
      
      const response = await axiosInstance.delete(`/api/products/${deleteConfirmation.id}`);
      
      if (response.data.success) {
        const productName = deleteConfirmation.name;
        const updatedProducts = dashboardData.products.filter(p => p.id !== deleteConfirmation.id);
        
        setDashboardData({
          ...dashboardData,
          products: updatedProducts
        });
        
        showSnackbar(`${productName} deleted successfully`, "error");
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      showSnackbar(`Failed to delete product: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setDeleteConfirmation(null);
      setIsLoading(false);
    }
  };

  // Handle stock adjustment
  const handleStockAdjustment = async (product, amount) => {
    try {
      const newStock = Math.max(0, product.stock + amount);
      
      // Update product stock in the database
      const response = await axiosInstance.put(`/api/products/${product.id}`, {
        stock: newStock
      });
      
      if (response.data.success) {
        const updatedProducts = dashboardData.products.map(p => {
          if (p.id === product.id) {
            return {
              ...p,
              stock: newStock,
              inventoryStatus: newStock > 10 ? "In Stock" : newStock > 0 ? "Low Stock" : "Out of Stock"
            };
          }
          return p;
        });
        
        setDashboardData({
          ...dashboardData,
          products: updatedProducts
        });
      }
    } catch (err) {
      console.error('Error updating product stock:', err);
      showSnackbar(`Failed to update stock: ${err.response?.data?.message || err.message}`, "error");
    }
  };

  // Navigate to add product page
  const handleAddProductClick = () => {
    navigate("/seller/add-product");
  };

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Handle File objects (when updating with a new image)
    if (imagePath instanceof File) {
      return URL.createObjectURL(imagePath);
    }
    
    // If it's already a full URL or data URL
    if (typeof imagePath === 'string' && (imagePath.startsWith('http') || imagePath.startsWith('data:'))) {
      return imagePath;
    }
    
    // If it's a server path
    return `${axiosInstance.defaults.baseURL}${imagePath}`;
  };

  if (error) {
  return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Seller Dashboard</h1>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setTimeRange("week")}
              className={`px-3 py-1 rounded-md ${timeRange === "week" 
                ? "bg-indigo-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-100"}`}
            >
              Week
            </button>
            <button 
              onClick={() => setTimeRange("month")}
              className={`px-3 py-1 rounded-md ${timeRange === "month" 
                ? "bg-indigo-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-100"}`}
            >
              Month
            </button>
            <button 
              onClick={() => setTimeRange("year")}
              className={`px-3 py-1 rounded-md ${timeRange === "year" 
                ? "bg-indigo-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-100"}`}
            >
              Year
            </button>
          </div>
      </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <FaSpinner className="text-indigo-600 text-4xl animate-spin" />
          </div>
        ) : (
          <>
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard 
                title="Total Sales" 
                value={dashboardData.totalSales} 
                icon={<FaShoppingCart />} 
                change={dashboardData.performanceMetrics.salesGrowth} 
                color="indigo" 
              />
              <MetricCard 
                title="Total Revenue" 
                value={`$${dashboardData.totalRevenue.toLocaleString()}`} 
                icon={<FaDollarSign />} 
                change={dashboardData.performanceMetrics.revenueGrowth} 
                color="green" 
              />
              <MetricCard 
                title="Avg. Order Value" 
                value={`$${dashboardData.performanceMetrics.averageOrderValue}`} 
                icon={<FaClipboardList />} 
                color="amber" 
              />
              <MetricCard 
                title="Conversion Rate" 
                value={`${dashboardData.performanceMetrics.conversionRate}%`} 
                icon={<FaChartBar />} 
                color="rose" 
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Sales Growth Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Sales Growth</h3>
                <div className="h-64">
                  <Line 
                    data={salesGrowthData} 
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Product Categories */}
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Product Categories</h3>
                <div className="h-64 flex items-center justify-center">
                  <Doughnut 
                    data={productCategoryData} 
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 12,
                            padding: 15
                          }
                        }
                      },
                      cutout: '70%'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Top Selling Products</h3>
              <div className="h-64">
                <Bar 
                  data={topProductsData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          display: true,
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Inventory Alerts */}
            {dashboardData.inventoryAlerts.length > 0 && (
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Inventory Alerts</h3>
                <div className="space-y-3">
                  {dashboardData.inventoryAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                      <FaExclamationTriangle className="text-red-500 mr-3" />
                      <div>
                        <p className="font-medium text-red-700 dark:text-red-400">{alert.product}</p>
                        <p className="text-sm text-red-600 dark:text-red-300">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products Section */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Your Products</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <button 
                    onClick={handleAddProductClick}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    <FaPlus className="mr-2" /> Add Product
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="relative p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
                      {/* Product Actions */}
                      <div className="absolute top-3 right-3 flex space-x-2">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/50"
                          title="Edit product"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product)}
                          className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/50"
                          title="Delete product"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      
                      {product.image && (
                        <div className="w-full h-40 flex items-center justify-center overflow-hidden rounded-md mb-3 bg-gray-50 dark:bg-gray-700/30">
                          <img 
                            src={getImageUrl(product.image)} 
                            alt={product.name} 
                            className="max-w-full max-h-40 object-contain"
                          />
                        </div>
                      )}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-800 dark:text-white">{product.name}</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{product.category}</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">${product.price}</p>
                        </div>
                        <div className={`px-2 py-1 text-xs rounded-md ${getInventoryStatusColor(product.inventoryStatus)}`}>
                          {product.inventoryStatus}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm text-gray-500">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{product.stock}</span> in stock
                          </div>
                          <div className="text-sm text-gray-500">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{product.sold}</span> sold
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-1">
                            <button 
                              onClick={() => handleStockAdjustment(product, -1)}
                              className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                              disabled={product.stock <= 0}
                              title="Decrease stock"
                            >
                              -
                            </button>
                            <button 
                              onClick={() => handleStockAdjustment(product, 1)}
                              className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                              title="Increase stock"
                            >
                              +
                            </button>
                          </div>
                          <button 
                            onClick={() => handleStockAdjustment(product, -product.stock)}
                            className="text-xs text-red-500 hover:text-red-700 dark:text-red-400"
                            disabled={product.stock <= 0}
                          >
                            Set to zero
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-3 text-center py-8">No products found.</p>
                )}
              </div>
      </div>

      {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Recent Orders</h3>
        {dashboardData.recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="p-3 text-gray-600 dark:text-gray-400 font-medium">Order ID</th>
                        <th className="p-3 text-gray-600 dark:text-gray-400 font-medium">Customer</th>
                        <th className="p-3 text-gray-600 dark:text-gray-400 font-medium">Date</th>
                        <th className="p-3 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                        <th className="p-3 text-gray-600 dark:text-gray-400 font-medium">Total</th>
                        <th className="p-3 text-gray-600 dark:text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentOrders.map((order) => (
                        <tr key={order.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="p-3 font-medium">#{order.id}</td>
                  <td className="p-3">{order.customer}</td>
                          <td className="p-3 text-gray-500">{order.date}</td>
                  <td className="p-3">
                            <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                          <td className="p-3 font-medium">${order.total}</td>
                          <td className="p-3">
                            <button className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                              View Details
                            </button>
                          </td>
                </tr>
              ))}
            </tbody>
          </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent orders.</p>
              )}
            </div>
          </>
        )}

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

        {/* Product Form Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {currentProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button 
                  onClick={() => setShowProductModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleProductSubmit} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Product Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={productFormData.name}
                      onChange={handleProductInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price ($)*
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={productFormData.price}
                      onChange={handleProductInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category*
                    </label>
                    <select
                      name="category"
                      value={productFormData.category}
                      onChange={(e) => {
                        const newCategory = e.target.value;
                        // Reset subcategory when category changes
                        setProductFormData({
                          ...productFormData,
                          category: newCategory,
                          subcategory: "" // Reset subcategory when category changes
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="art">Art</option>
                      <option value="clothing">Clothing</option>
                      <option value="ceramics">Ceramics</option>
                      <option value="jewellery">Jewellery</option>
                      <option value="wooden">Wooden Crafts</option>
                      <option value="clay">Clay Items</option>
                      <option value="decor">Handmade Decor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subcategory*
                    </label>
                    <select
                      name="subcategory"
                      value={productFormData.subcategory}
                      onChange={handleProductInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Select a subcategory</option>
                      {availableSubcategories.map((subcategory, index) => (
                        <option key={index} value={subcategory ? subcategory.toLowerCase() : ''}>
                          {subcategory || ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tag*
                    </label>
                    <select
                      name="tag"
                      value={productFormData.tag}
                      onChange={handleProductInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Select a tag</option>
                      {productTags.map((tag, index) => (
                        <option key={index} value={tag.value}>{tag.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Stock*
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={productFormData.stock}
                      onChange={handleProductInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Product Image* (JPG/JPEG only)
                    </label>
                    <div 
                      onClick={handleUploadClick}
                      className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md hover:border-indigo-500 dark:hover:border-indigo-600 cursor-pointer transition-colors"
                    >
                      {productFormData.imagePreview || productFormData.image ? (
                        <div className="relative w-full">
                          <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-700/30 rounded-md mb-2 p-2">
                            <img 
                              src={productFormData.imagePreview || getImageUrl(productFormData.image)} 
                              alt="Product preview" 
                              className="max-h-48 object-contain"
                            />
                          </div>
                          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                            Click to change image
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1 text-center">
                          <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600 dark:text-gray-400">
                            <p className="pl-1">Click to upload a product image</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            JPG, JPEG up to 5MB
                          </p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,image/jpeg,image/jpg"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <FaSpinner className="inline mr-2 animate-spin" />
                    ) : (
                      <FaSave className="inline mr-2" />
                    )}
                    {currentProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-semibold">{deleteConfirmation.name}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProduct}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Metric Card with trend indicator
const MetricCard = ({ title, value, icon, change, color }) => {
  const colors = {
    indigo: "border-indigo-500 text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20",
    green: "border-green-500 text-green-500 bg-green-50 dark:bg-green-900/20",
    amber: "border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-900/20",
    rose: "border-rose-500 text-rose-500 bg-rose-50 dark:bg-rose-900/20",
  };

  return (
    <div className={`p-6 shadow-sm rounded-lg border-l-4 ${colors[color]} bg-white dark:bg-gray-800 transition-all duration-300`}>
      <div className="flex justify-between items-start">
      <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">{value}</p>
          
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <FaArrowUp className="text-green-500 mr-1 text-xs" />
              ) : (
                <FaArrowDown className="text-red-500 mr-1 text-xs" />
              )}
              <span className={change >= 0 ? "text-green-500 text-sm" : "text-red-500 text-sm"}>
                {Math.abs(change)}% from last period
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-opacity-20 ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Enhanced Product Card
const ProductCard = ({ product }) => {
  return (
    <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
      {product.image && (
        <img 
          src={getImageUrl(product.image)} 
          alt={product.name} 
          className="w-full h-40 object-cover rounded-md mb-3"
        />
      )}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">{product.name}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{product.category}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">${product.price}</p>
        </div>
        <div className={`px-2 py-1 text-xs rounded-md ${getInventoryStatusColor(product.inventoryStatus)}`}>
          {product.inventoryStatus}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-700 dark:text-gray-300">{product.stock}</span> in stock
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-700 dark:text-gray-300">{product.sold}</span> sold
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            <button 
              onClick={() => handleStockAdjustment(product, -1)}
              className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              disabled={product.stock <= 0}
              title="Decrease stock"
            >
              -
            </button>
            <button 
              onClick={() => handleStockAdjustment(product, 1)}
              className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              title="Increase stock"
            >
              +
            </button>
          </div>
          <button 
            onClick={() => handleStockAdjustment(product, -product.stock)}
            className="text-xs text-red-500 hover:text-red-700 dark:text-red-400"
            disabled={product.stock <= 0}
          >
            Set to zero
          </button>
        </div>
      </div>
    </div>
  );
};

// Get Status Color
const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return "bg-amber-500 text-white";
    case "Processing":
      return "bg-blue-500 text-white";
    case "Shipped":
      return "bg-indigo-500 text-white";
    case "Delivered":
      return "bg-green-500 text-white";
    case "Cancelled":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

// Get Inventory Status Color
const getInventoryStatusColor = (status) => {
  switch (status) {
    case "In Stock":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "Low Stock":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    case "Out of Stock":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};

// Mock data generator function
const getMockData = (timeRange) => {
  // Generate different data based on time range
  const salesMultiplier = timeRange === "week" ? 1 : timeRange === "month" ? 4 : 12;
  
  // Generate sales growth data points
  const salesGrowth = [];
  const labels = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 12;
  const labelFormat = timeRange === "year" ? "month" : "day";
  
  for (let i = 0; i < labels; i++) {
    salesGrowth.push({
      date: labelFormat === "month" ? `Month ${i+1}` : `Day ${i+1}`,
      sales: Math.floor(Math.random() * 100) + 50
    });
  }
  
  // Generate top products
  const topProducts = [
    { name: "Handcrafted Pottery", unitsSold: 124 * salesMultiplier },
    { name: "Woven Basket", unitsSold: 98 * salesMultiplier },
    { name: "Macrame Wall Hanging", unitsSold: 86 * salesMultiplier },
    { name: "Hand-painted Scarf", unitsSold: 72 * salesMultiplier },
    { name: "Wooden Cutting Board", unitsSold: 65 * salesMultiplier }
  ];
  
  // Generate products
  const products = [
    { 
      id: 1, 
      name: "Handcrafted Pottery Bowl", 
      price: 45.99, 
      category: "Home Decor",
      inventoryStatus: "In Stock",
      stock: 24,
      sold: 124,
      image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
    },
    { 
      id: 2, 
      name: "Woven Basket Set", 
      price: 89.99, 
      category: "Home Decor",
      inventoryStatus: "Low Stock",
      stock: 5,
      sold: 98,
      image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
    },
    { 
      id: 3, 
      name: "Macrame Wall Hanging", 
      price: 65.00, 
      category: "Home Decor",
      inventoryStatus: "In Stock",
      stock: 18,
      sold: 86,
      image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
    },
    { 
      id: 4, 
      name: "Hand-painted Silk Scarf", 
      price: 38.50, 
      category: "Accessories",
      inventoryStatus: "Out of Stock",
      stock: 0,
      sold: 72,
      image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
    },
    { 
      id: 5, 
      name: "Wooden Cutting Board", 
      price: 52.99, 
      category: "Kitchen",
      inventoryStatus: "In Stock",
      stock: 12,
      sold: 65,
      image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
    },
    { 
      id: 6, 
      name: "Ceramic Mug Set", 
      price: 34.99, 
      category: "Kitchen",
      inventoryStatus: "In Stock",
      stock: 28,
      sold: 54,
      image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80"
    }
  ];
  
  // Generate recent orders
  const recentOrders = [
    { id: "ORD-7829", customer: "Emma Johnson", date: "2023-06-15", status: "Delivered", total: 134.99 },
    { id: "ORD-7830", customer: "Michael Smith", date: "2023-06-14", status: "Shipped", total: 89.99 },
    { id: "ORD-7831", customer: "Sophia Williams", date: "2023-06-14", status: "Processing", total: 65.00 },
    { id: "ORD-7832", customer: "James Brown", date: "2023-06-13", status: "Pending", total: 52.99 },
    { id: "ORD-7833", customer: "Olivia Davis", date: "2023-06-12", status: "Cancelled", total: 38.50 }
  ];
  
  // Generate inventory alerts
  const inventoryAlerts = [
    { product: "Woven Basket Set", message: "Only 5 items left in stock" },
    { product: "Hand-painted Silk Scarf", message: "Out of stock - 12 backorders pending" }
  ];
  
  return {
    totalSales: 498 * salesMultiplier,
    totalRevenue: 24950 * salesMultiplier,
    totalOrders: 125 * salesMultiplier,
    products,
    salesGrowth,
    recentOrders,
    topProducts,
    inventoryAlerts,
    performanceMetrics: {
      salesGrowth: 12.5,
      revenueGrowth: 15.2,
      averageOrderValue: 78.5,
      conversionRate: 3.2
    }
  };
};

export default SellerDashboard;
