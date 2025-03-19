import React, { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Footer from "../Footer/Footer";
import { productService } from "../../services/api";

// Category mapping for sidebar and display
const categoryMapping = {
  'home-living': {
    title: "Home & Living",
    sidebar: [
      "Home Decor",
      "Bedding and Pillows",
      "Kitchen & Dining",
      "Storage & Organization"
    ],
    description: "Explore our collection of home and living products that enhance your space."
  },
  clothing: {
    title: "Clothing",
    sidebar: [
      "Shirt",
      "Saree",
      "Kurthi sets",
      "Pants",
      "Dhoti",
      "Dupatta"
    ],
    description: "Discover our range of handcrafted clothing made with love."
  },
  'handmade-gifts': {
    title: "Handmade Gifts & Personalized Items",
    sidebar: [
      "Custom Nameplates & Signs",
      "Engraved Jewelry & Accessories",
      "Handmade Greeting Cards",
      "Photo Frames & Personalized Art"
    ],
    description: "Find the perfect personalized gift for your loved ones."
  },
  jewellery: {
    title: "Jewellery",
    sidebar: [
      "Necklaces",
      "Earrings",
      "Bracelets",
      "Rings"
    ],
    description: "Adorn yourself with our exquisite jewellery collection."
  },
  toys: {
    title: "Toys",
    sidebar: [
      "Action Figures",
      "Educational Toys",
      "Stuffed Animals",
      "Puzzles"
    ],
    description: "Explore our fun and educational toys for children."
  },
  'bath-beauty': {
    title: "Bath & Beauty",
    sidebar: [
      "Handmade Soaps",
      "Skincare Products",
      "Haircare Products",
      "Aromatherapy & Essential Oils"
    ],
    description: "Pamper yourself with our natural bath and beauty products."
  },
  art: {
    title: "Art",
    sidebar: [
      "Paintings & Drawings",
      "Sculptures",
      "Handmade Prints",
      "Handcrafted Cards & Stationery"
    ],
    description: "Discover unique art pieces created by talented artisans."
  },
  accessories: {
    title: "Accessories",
    sidebar: [
      "Bags & Purses",
      "Footwear",
      "Hats & Hair Accessories"
    ],
    description: "Complete your look with our stylish accessories."
  }
};

const Sidebar = ({ category }) => {
  const navigate = useNavigate();
  const categoryInfo = categoryMapping[category] || categoryMapping.art;
  const [activeSubcategory, setActiveSubcategory] = useState(categoryInfo.sidebar[0]);
  
  const handleSubcategoryClick = (subcategory) => {
    setActiveSubcategory(subcategory);
    
    // Define the filter based on subcategory
    let filter = {};
    
    // If it's not "All", apply specific filter
    if (!subcategory.toLowerCase().startsWith('all')) {
      // Map subcategory names to appropriate filter parameters
      // This would depend on your backend API implementation
      const subcategoryParam = subcategory.toLowerCase().replace(' ', '-');
      navigate(`/products/${category}?subcategory=${subcategoryParam}`);
    } else {
      // If "All" is selected, navigate to the main category
      navigate(`/products/${category}`);
    }
  };
  
  return (
    <div className="w-1/4 p-6 border-r bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Shop by Category</h2>
      <ul className="space-y-3 text-gray-700 font-medium">
        {categoryInfo.sidebar.map((item, index) => (
          <li 
            key={index} 
            className={`cursor-pointer hover:text-black transition-colors duration-200 py-2 px-3 rounded ${
              activeSubcategory === item 
                ? "bg-black text-white" 
                : "hover:bg-gray-200"
            }`}
            onClick={() => handleSubcategoryClick(item)}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleViewProduct = () => {
    // Navigate to product detail page
    navigate(`/product/${product._id || product.id}`);
  };

  return (
    <div className="border rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition duration-300">
      <div className="relative">
        {product.tag && (
          <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded-full z-10">
            {product.tag}
          </span>
        )}
        <div className="w-full h-48 flex items-center justify-center overflow-hidden rounded-md bg-gray-50 mb-3">
          <img
            src={product.image}
            alt={product.name}
            className="max-w-full max-h-48 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
            }}
          />
        </div>
      </div>
      <div className="flex flex-col h-28">
        <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mt-1 mb-auto line-clamp-2">{product.description}</p>
        <p className="text-black font-bold text-xl mt-2">${parseFloat(product.price).toFixed(2)}</p>
      </div>
      <div className="flex gap-2 mt-3">
        <button 
          className="bg-black text-white flex items-center justify-center px-5 py-2 rounded-lg flex-1 hover:bg-gray-800 transition"
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Add to Cart
        </button>
        <button 
          onClick={handleViewProduct}
          className="border border-black text-black px-3 py-2 rounded-lg hover:bg-gray-100 transition"
          aria-label={`View ${product.name} details`}
        >
          View
        </button>
      </div>
    </div>
  );
};

const ProductPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const subcategory = queryParams.get('subcategory');
  
  const [sortBy, setSortBy] = useState("bestsellers");
  const [itemsToShow, setItemsToShow] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  
  // Active filters state
  const [activeFilters, setActiveFilters] = useState([]);
  
  // Determine the current category from URL or props
  let currentCategory;
  
  // Check if we're using a direct route like /Art or /Clothing
  if (!category) {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('art')) currentCategory = 'art';
    else if (path.includes('clothing')) currentCategory = 'clothing';
    else if (path.includes('ceramics')) currentCategory = 'ceramics';
    else if (path.includes('jewellery') || path.includes('jewelry')) currentCategory = 'jewellery';
    else if (path.includes('wooden')) currentCategory = 'wooden';
    else if (path.includes('clay')) currentCategory = 'clay';
    else if (path.includes('decor')) currentCategory = 'decor';
    else currentCategory = 'art'; // Default
  } else {
    currentCategory = category.toLowerCase();
  }
  
  const categoryTitle = categoryMapping[currentCategory]?.title || "Products";

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Prepare query parameters
        const params = {
          category: currentCategory,
          page: currentPage,
          limit: itemsToShow,
          sort: sortBy
        };
        
        // Add subcategory filter if present
        if (subcategory) {
          params.subcategory = subcategory;
        }
        
        const response = await productService.getAllProducts(params);
        
        if (response.data.success) {
          setProducts(response.data.products);
          setTotalPages(response.data.totalPages || 1);
        } else {
          setError('Failed to fetch products');
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Error fetching products. Please try again later.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [currentCategory, currentPage, itemsToShow, sortBy, subcategory]);

  // Handle category not found
  useEffect(() => {
    if (!categoryMapping[currentCategory]) {
      navigate("/products/art");
    }
  }, [currentCategory, navigate]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Add or remove filter
  const toggleFilter = (filterType, value) => {
    // Check if filter already exists
    const existingFilter = activeFilters.find(
      filter => filter.type === filterType && filter.value === value
    );
    
    if (existingFilter) {
      // Remove filter
      setActiveFilters(activeFilters.filter(filter => 
        !(filter.type === filterType && filter.value === value)
      ));
    } else {
      // Add filter
      setActiveFilters([...activeFilters, { type: filterType, value }]);
    }
  };
  
  // Remove all filters
  const clearAllFilters = () => {
    setActiveFilters([]);
    navigate(`/products/${currentCategory}`);
  };

  return (
    <>
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar category={currentCategory} />
        <div className="w-3/4 p-8">
          {/* Breadcrumb navigation */}
          <nav className="flex mb-4 text-sm" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="text-gray-600 hover:text-gray-900">
                  Home
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <a href="/products" className="text-gray-600 hover:text-gray-900">
                    Products
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-800 font-medium">{categoryTitle}</span>
                </div>
              </li>
              {subcategory && (
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-800 font-medium">
                      {subcategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </li>
              )}
            </ol>
          </nav>
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">{categoryTitle}</h1>
            </div>
            <div className="flex space-x-4">
              <select 
                className="border p-2 rounded"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="bestsellers">Sort by: Best Sellers</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
              <select 
                className="border p-2 rounded"
                value={itemsToShow}
                onChange={(e) => setItemsToShow(Number(e.target.value))}
              >
                <option value="12">Show: 12</option>
                <option value="24">24</option>
                <option value="36">36</option>
              </select>
            </div>
          </div>
          
          {/* Active filters display */}
          {(subcategory || activeFilters.length > 0) && (
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                
                {subcategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-black text-white">
                    {subcategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    <button 
                      onClick={() => navigate(`/products/${currentCategory}`)}
                      className="ml-2 focus:outline-none"
                      aria-label="Remove subcategory filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                
                {activeFilters.map((filter, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800"
                  >
                    {filter.type}: {filter.value}
                    <button 
                      onClick={() => toggleFilter(filter.type, filter.value)} 
                      className="ml-2 focus:outline-none"
                      aria-label={`Remove ${filter.type} filter`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                
                {(subcategory || activeFilters.length > 0) && (
                  <button 
                    onClick={clearAllFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-800 ml-2"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Product description */}
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-600">
              {categoryMapping[currentCategory]?.description || 
                `Explore our collection of authentic ${categoryTitle.toLowerCase()} handcrafted by skilled artisans 
                using traditional techniques. Each piece is unique and tells a story of cultural heritage and craftsmanship.`}
            </p>
          </div>
          
          {/* Loading and error states */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
          )}
          
          {error && !loading && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          {/* Products grid */}
          {!loading && !error && (
            <>
              {products.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-lg">No products found in this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id || product.id} product={product} />
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border rounded ${
                      currentPage === page
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                {currentPage < totalPages && (
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductPage; 