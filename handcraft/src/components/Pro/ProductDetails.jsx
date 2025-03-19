import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Check,
  Info,
  Truck,
  RefreshCw,
  Shield
} from "lucide-react";
import Footer from "../Footer/Footer";
import { productService } from "../../services/api";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State variables
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  
  // Image gallery (will use product.image as primary and these as additional)
  const [images, setImages] = useState([]);
  
  // Fetch product data
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await productService.getProductById(id);
        
        if (response.data.success) {
          setProduct(response.data.product);
          
          // Set up image gallery with main image and additional images
          // In a real app, you'd have multiple images from the backend
          const productImage = response.data.product.image;
          setImages([
            productImage,
            // Simulate additional product images for the gallery
            // In a real app, these would come from the backend
            productImage, 
            productImage
          ]);
          
          // Fetch related products by same category
          fetchRelatedProducts(response.data.product.category);
        } else {
          setError('Failed to fetch product details');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Error fetching product details. Please try again later.');
        
        // For development/demo: Use mock data if API fails
        useMockProductData();
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id]);
  
  // Fetch related products
  const fetchRelatedProducts = async (category) => {
    try {
      const response = await productService.getProductsByCategory(category, { limit: 4 });
      
      if (response.data.success) {
        // Filter out the current product
        const related = response.data.products.filter(p => p._id !== id);
        setRelatedProducts(related.slice(0, 4)); // Limit to 4 related products
      }
    } catch (err) {
      console.error('Error fetching related products:', err);
      // Silently fail - related products are not critical
    }
  };
  
  // For development/demo: Use mock data if API fails
  const useMockProductData = () => {
    // Mock product with all fields that would be expected from API
    const mockProduct = {
      _id: id,
      name: "Handcrafted Wooden Sculpture",
      price: 129.99,
      description: "Beautifully hand-carved wooden sculpture made by skilled artisans using traditional techniques. Each piece is unique and showcases the natural beauty of the wood.",
      image: "https://5.imimg.com/data5/SELLER/Default/2021/8/UT/BZ/OD/11746368/wooden-chess-set.jpg",
      category: "wooden",
      tag: "Bestseller",
      stock: 15,
      seller: { _id: "seller123", name: "Artisan Crafts" },
      ratings: [
        { 
          user: { _id: "user1", name: "Sarah Johnson" },
          rating: 5,
          review: "Absolutely beautiful craftsmanship! The attention to detail is amazing.",
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
        },
        {
          user: { _id: "user2", name: "Michael Chen" },
          rating: 4,
          review: "Great quality and beautiful design. Shipping was fast too.",
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        }
      ],
      averageRating: 4.5,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    };
    
    setProduct(mockProduct);
    
    // Set mock images
    setImages([mockProduct.image, mockProduct.image, mockProduct.image]);
    
    // Set mock related products
    setRelatedProducts([
      {
        _id: "rel1",
        name: "Wooden Wall Hanging",
        price: 65.0,
        image: "https://5.imimg.com/data5/SELLER/Default/2022/2/YZ/DP/WC/148971249/wooden-wall-hanging.jpg",
        tag: "Bestseller",
        averageRating: 4.2
      },
      {
        _id: "rel2",
        name: "Wooden Coaster Set",
        price: 25.0,
        image: "https://m.media-amazon.com/images/I/71JKkwKFbIL._AC_UF1000,1000_QL80_.jpg",
        tag: "Trending",
        averageRating: 4.0
      },
      {
        _id: "rel3",
        name: "Wooden Chess Set",
        price: 120.0,
        image: "https://5.imimg.com/data5/SELLER/Default/2021/8/UT/BZ/OD/11746368/wooden-chess-set.jpg",
        tag: "Limited",
        averageRating: 4.8
      }
    ]);
  };
  
  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    // Ensure quantity is within valid range
    if (newQuantity > 0 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };
  
  // Toggle wishlist status
  const toggleWishlist = () => {
    // In a real app, this would call an API to add/remove from wishlist
    setInWishlist(!inWishlist);
    showNotification(
      !inWishlist 
        ? "Product added to wishlist" 
        : "Product removed from wishlist", 
      "success"
    );
  };
  
  // Add to cart
  const addToCart = () => {
    // In a real app, this would call an API to add to cart
    setInCart(true);
    showNotification("Product added to cart", "success");
    
    // After a delay, reset the button state
    setTimeout(() => {
      setInCart(false);
    }, 2000);
  };
  
  // Submit a review
  const submitReview = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      showNotification("Please select a rating", "error");
      return;
    }
    
    try {
      const response = await productService.addProductRating(id, { rating, review });
      
      if (response.data.success) {
        // Update the product with new rating/review
        setProduct(response.data.product);
        showNotification("Thank you for your review!", "success");
        
        // Reset form
        setRating(0);
        setReview("");
        setShowReviewForm(false);
      } else {
        showNotification("Failed to submit review", "error");
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      showNotification("Error submitting review. Please try again.", "error");
      
      // For development/demo: Add mock review if API fails
      if (product) {
        const newRating = {
          user: { _id: "current-user", name: "You" },
          rating,
          review,
          date: new Date()
        };
        
        const updatedProduct = {
          ...product,
          ratings: [...product.ratings, newRating]
        };
        
        setProduct(updatedProduct);
        showNotification("Thank you for your review!", "success");
        
        // Reset form
        setRating(0);
        setReview("");
        setShowReviewForm(false);
      }
    }
  };
  
  // Display notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };
  
  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };
  
  // Navigate to a related product
  const goToRelatedProduct = (productId) => {
    navigate(`/product/${productId}`);
    // Scroll to top
    window.scrollTo(0, 0);
  };
  
  // Share product
  const shareProduct = () => {
    // In a real app, this would open native share dialog or copy link
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      showNotification("Link copied to clipboard", "success");
    }
  };
  
  // Render star rating component
  const renderStarRating = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            className={`${
              star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
        <Info size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h1>
        <p className="text-gray-600 mb-6">{error || "We couldn't find the product you're looking for."}</p>
        <button 
          onClick={handleBack}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition flex items-center"
        >
          <ArrowLeft size={18} className="mr-2" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white flex items-center`}>
          {notification.type === 'success' ? <Check size={18} className="mr-2" /> : <Info size={18} className="mr-2" />}
          <p>{notification.message}</p>
        </div>
      )}
      
      <div className="bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center text-sm text-gray-600 mb-6">
            <button 
              onClick={handleBack} 
              className="flex items-center hover:text-black transition mr-4"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back
            </button>
            <a href="/" className="hover:text-black transition">Home</a>
            <span className="mx-2">/</span>
            <a href="/products" className="hover:text-black transition">Products</a>
            <span className="mx-2">/</span>
            <a 
              href={`/products/${product.category}`} 
              className="hover:text-black transition"
            >
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium">{product.name}</span>
          </div>
          
          {/* Product details section */}
          <div className="flex flex-col lg:flex-row bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Product images */}
            <div className="lg:w-1/2 p-6">
              <div className="relative rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center h-[400px]">
                {product.tag && (
                  <span className="absolute top-4 left-4 bg-black text-white text-xs px-3 py-1 rounded-full z-10">
                    {product.tag}
                  </span>
                )}
                <img 
                  src={images[selectedImage]} 
                  alt={product.name}
                  className="max-w-full max-h-[350px] object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Available';
                  }}
                />
              </div>
              
              {/* Image thumbnails */}
              <div className="flex mt-4 space-x-2 justify-center">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 ${
                      selectedImage === index ? 'border-black' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Product info */}
            <div className="lg:w-1/2 p-8 flex flex-col">
              <div className="mb-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                
                {/* Rating summary */}
                <div className="flex items-center mb-4">
                  {renderStarRating(product.averageRating)}
                  <span className="ml-2 text-gray-600">
                    {product.averageRating.toFixed(1)} ({product.ratings.length} reviews)
                  </span>
                </div>
                
                {/* Price */}
                <p className="text-3xl font-bold text-gray-900 mb-6">${parseFloat(product.price).toFixed(2)}</p>
                
                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-gray-600">{product.description}</p>
                </div>
                
                {/* Stock status */}
                <div className="mb-6">
                  <span className={`${
                    product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  } px-3 py-1 rounded-full text-sm font-medium`}>
                    {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                  </span>
                </div>
                
                {/* Seller info */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Seller</h2>
                  <p className="text-gray-600">{product.seller.name}</p>
                </div>
              </div>
              
              {/* Quantity selector */}
              <div className="flex items-center mb-6">
                <span className="mr-4 text-gray-700">Quantity:</span>
                <div className="flex border rounded-lg">
                  <button 
                    className="px-3 py-1 border-r hover:bg-gray-100"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-1 flex items-center justify-center min-w-[40px]">
                    {quantity}
                  </span>
                  <button 
                    className="px-3 py-1 border-l hover:bg-gray-100"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button 
                  className={`flex-1 bg-black text-white py-3 px-6 rounded-lg flex items-center justify-center ${
                    inCart ? 'bg-green-600' : 'hover:bg-gray-800'
                  } transition duration-300`}
                  onClick={addToCart}
                  disabled={inCart || product.stock <= 0}
                >
                  {inCart ? (
                    <>
                      <Check size={20} className="mr-2" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} className="mr-2" />
                      Add to Cart
                    </>
                  )}
                </button>
                
                <button 
                  className={`flex-none py-3 px-4 rounded-lg border ${
                    inWishlist 
                      ? 'bg-pink-50 border-pink-300 text-pink-500' 
                      : 'border-gray-300 hover:bg-gray-50'
                  } transition duration-300`}
                  onClick={toggleWishlist}
                >
                  <Heart 
                    size={20} 
                    className={inWishlist ? 'fill-pink-500 text-pink-500' : ''} 
                  />
                </button>
                
                <button 
                  className="flex-none py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition duration-300"
                  onClick={shareProduct}
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Additional information */}
          <div className="bg-white rounded-xl shadow-sm mt-8 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <Truck className="text-gray-700 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900">Free Shipping</h3>
                  <p className="text-sm text-gray-600">On orders over $100</p>
                </div>
              </div>
              <div className="flex items-start">
                <RefreshCw className="text-gray-700 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900">Easy Returns</h3>
                  <p className="text-sm text-gray-600">30 day return policy</p>
                </div>
              </div>
              <div className="flex items-start">
                <Shield className="text-gray-700 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900">Secure Checkout</h3>
                  <p className="text-sm text-gray-600">SSL encrypted payment</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Reviews section */}
          <div className="bg-white rounded-xl shadow-sm mt-8 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Customer Reviews</h2>
              <button 
                className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                Write a Review
              </button>
            </div>
            
            {/* Review form */}
            {showReviewForm && (
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h3 className="text-lg font-semibold mb-4">Share Your Experience</h3>
                <form onSubmit={submitReview}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Rating</label>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={24}
                          className={`cursor-pointer mr-1 ${
                            star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                          }`}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Review (optional)</label>
                    <textarea
                      className="w-full border rounded-lg p-3 text-gray-700"
                      rows={4}
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Share your thoughts about this product..."
                    />
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="button"
                      className="mr-3 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                      onClick={() => setShowReviewForm(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="bg-black text-white py-2 px-6 rounded-lg hover:bg-gray-800 transition"
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Reviews list */}
            {product.ratings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {product.ratings.map((rating, index) => (
                  <div key={index} className="border-b pb-6 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{rating.user.name}</p>
                        <div className="flex items-center mt-1">
                          {renderStarRating(rating.rating)}
                          <span className="ml-2 text-gray-500 text-sm">
                            {formatDate(rating.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {rating.review && (
                      <p className="mt-3 text-gray-700">{rating.review}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Related products section */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relProduct) => (
                  <div 
                    key={relProduct._id} 
                    className="border rounded-xl shadow-sm bg-white hover:shadow-md transition duration-300 cursor-pointer"
                    onClick={() => goToRelatedProduct(relProduct._id)}
                  >
                    <div className="relative">
                      {relProduct.tag && (
                        <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded-full z-10">
                          {relProduct.tag}
                        </span>
                      )}
                      <div className="w-full h-48 flex items-center justify-center overflow-hidden rounded-t-md bg-gray-50">
                        <img
                          src={relProduct.image}
                          alt={relProduct.name}
                          className="max-w-full max-h-48 object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                          }}
                        />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg line-clamp-1">{relProduct.name}</h3>
                      <div className="flex items-center mt-1 mb-2">
                        {renderStarRating(relProduct.averageRating || 0)}
                      </div>
                      <p className="text-black font-bold">${parseFloat(relProduct.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetails; 