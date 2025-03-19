import React, { useState } from "react";
import Image1 from "../../assets/hero/women.png";
import Image2 from "../../assets/hero/shopping.png";
import Image3 from "../../assets/hero/sale.png";
import Slider from "react-slick";
import { Link, useLocation } from "react-router-dom";
import { FaCaretDown, FaPaintBrush, FaTshirt, FaGem, FaMugHot, FaHome, FaGift, FaSoap, FaShoppingBag, FaPuzzlePiece } from "react-icons/fa";
import { GiWoodenCrate, GiFlowerPot } from "react-icons/gi";

// Define categories and subcategories with icons
const ProductCategories = [
  { 
    id: 1, 
    name: "Home & Living", 
    icon: <FaHome size={24} />,
    link: "/products/home-living",
    subcategories: ["Home Decor", "Bedding and Pillows", "Kitchen & Dining", "Storage & Organization"]
  },
  { 
    id: 2, 
    name: "Clothing", 
    icon: <FaTshirt size={24} />,
    link: "/products/clothing",
    subcategories: ["Shirt", "Saree", "Kurthi sets", "Pants", "Dhoti", "Dupatta"]
  },
  { 
    id: 3, 
    name: "Handmade Gifts & Personalized Items", 
    icon: <FaGift size={24} />,
    link: "/products/handmade-gifts",
    subcategories: ["Custom Nameplates & Signs", "Engraved Jewelry & Accessories", "Handmade Greeting Cards", "Photo Frames & Personalized Art"]
  },
  { 
    id: 4, 
    name: "Jewellery", 
    icon: <FaGem size={24} />,
    link: "/products/jewellery",
    subcategories: ["Necklaces", "Earrings", "Bracelets", "Rings"]
  },
  { 
    id: 5, 
    name: "Toys", 
    icon: <FaPuzzlePiece size={24} />,
    link: "/products/toys",
    subcategories: ["Action Figures", "Educational Toys", "Stuffed Animals", "Puzzles"]
  },
  { 
    id: 6, 
    name: "Bath & Beauty", 
    icon: <FaSoap size={24} />,
    link: "/products/bath-beauty",
    subcategories: ["Handmade Soaps", "Skincare Products", "Haircare Products", "Aromatherapy & Essential Oils"]
  },
  { 
    id: 7, 
    name: "Art", 
    icon: <FaPaintBrush size={24} />,
    link: "/products/art",
    subcategories: ["Paintings & Drawings", "Sculptures", "Handmade Prints", "Handcrafted Cards & Stationery"]
  },
  { 
    id: 8, 
    name: "Accessories", 
    icon: <FaShoppingBag size={24} />,
    link: "/products/accessories",
    subcategories: ["Bags & Purses", "Footwear", "Hats & Hair Accessories"]
  },
];

const ImageList = [
  {
    id: 1,
    img: Image1,
    title: "Up to 50% Off on All Handcrafted Clothing!",
    description:
    "Discover the beauty of artisanal fashion with our handcrafted clothing collection. Shop now and enjoy exclusive discounts for a limited time!",
  },
  {
    id: 2,
    img: Image2,
    title: "30% off on all Handcrafted Items",
    description:
      "Elevate your style with unique handcrafted items. Shop now and enjoy 30% off for a limited time!",
  },
  {
    id: 3,
    img: Image3,
    title: "70% Off on All Handcrafted Jewellery",
    description:
      "Adorn yourself with exquisite handcrafted jewellery. Shop now and enjoy up to 70% off for a limited time!",
  },
];

const Hero = ({ handleOrderPopup }) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [activeCategory, setActiveCategory] = useState(null);
  
  var settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 800,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    cssEase: "ease-in-out",
    pauseOnHover: false,
    pauseOnFocus: true,
  };

  return (
    <div className="relative overflow-hidden min-h-[550px] sm:min-h-[650px] bg-gray-100 dark:bg-slate-950 dark:text-white duration-200">
      {/* Category Icons at top */}
      {isHomePage && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-transparent py-2">
          <div className="container mx-auto">
            <div className="flex items-center justify-around">
              {ProductCategories.map((category) => (
                <div 
                  key={category.id} 
                  className="relative"
                  onMouseEnter={() => setActiveCategory(category.id)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <Link 
                    to={category.link} 
                    className="flex items-center justify-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition duration-200"
                    title={category.name}
                    aria-label={category.name}
                  >
                    <div className="text-gray-700 dark:text-gray-300 hover:text-primary text-2xl transition-colors">
                      {React.cloneElement(category.icon, { size: 28 })}
                    </div>
                  </Link>
                  
                  {activeCategory === category.id && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-full bg-white dark:bg-gray-800 shadow-lg rounded-md z-50 min-w-[220px] border border-gray-100 dark:border-gray-700 mt-2">
                      <div className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 mb-1">
                        <span className="font-medium flex items-center gap-2">
                          <span className="text-primary">{category.icon}</span>
                          {category.name}
                        </span>
                      </div>
                      <ul className="py-2">
                        {category.subcategories.map((subcategory, index) => (
                          <li key={index}>
                            <Link 
                              to={`${category.link}?subcategory=${subcategory.toLowerCase().replace(' ', '-')}`}
                              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                            >
                              {subcategory}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Background pattern */}
      <div className="h-[700px] w-[700px] bg-primary/40 absolute -top-1/2 right-0 rounded-3xl rotate-45 -z[8]"></div>

      {/* Hero section */}
      <div className="container pt-20 pb-8 flex justify-center items-center h-full">
        <Slider {...settings} className="w-full">
          {ImageList.map((data) => (
            <div key={data.id}>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                {/* Text content section */}
                <div className="flex flex-col justify-center gap-4 pt-12 sm:pt-0 text-center sm:text-left order-2 sm:order-1 relative z-10">
                  <h1
                    data-aos="zoom-out"
                    data-aos-duration="500"
                    data-aos-once="true"
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold"
                  >
                    {data.title}
                  </h1>
                  <p
                    data-aos="fade-up"
                    data-aos-duration="500"
                    data-aos-delay="100"
                    className="text-sm"
                  >
                    {data.description}
                  </p>
                  <div
                    data-aos="fade-up"
                    data-aos-duration="500"
                    data-aos-delay="300"
                  >
                    <button
                      onClick={handleOrderPopup}
                      className="bg-gradient-to-r from-primary to-secondary hover:scale-105 duration-200 text-white py-2 px-4 rounded-full"
                    >
                      Order Now
                    </button>
                  </div>
                </div>

                {/* Image section */}
                <div className="order-1 sm:order-2">
                  <div
                    data-aos="zoom-in"
                    data-aos-once="true"
                    className="relative z-10"
                  >
                    <img
                      src={data.img}
                      alt={data.title}
                      className="w-[300px] h-[300px] sm:h-[450px] sm:w-[450px] sm:scale-105 lg:scale-120 object-contain mx-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Hero;
