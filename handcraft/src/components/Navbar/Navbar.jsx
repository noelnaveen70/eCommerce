import React, { useState, useEffect } from "react";
import { IoMdSearch } from "react-icons/io";
import {
  FaShoppingCart,
  FaLock,
  FaCaretDown,
  FaBars,
  FaTimes,
  FaUserShield,
  FaStore,
  FaBell,
  FaSignOutAlt,
} from "react-icons/fa";
import { FiShoppingBag } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import DarkMode from "./DarkMode";
import { removeAuthToken, getAuthToken } from "../../utils/auth";

const scrollToFooter = () => {
  const footer = document.getElementById("footer");
  if (footer) {
    footer.scrollIntoView({ behavior: "smooth" });
  }
};

const Menu = [
  { id: 1, name: "Home", link: "/#" },
  { id: 2, name: "About Us", link: "/#about" },
  { id: 3, name: "Contact", action: scrollToFooter }, // Smooth scroll
];

const ProductCategories = [
  { id: 1, name: "Art", link: "/products/art" },
  { id: 2, name: "Clothing", link: "/products/clothing" },
  { id: 3, name: "Ceramics", link: "/products/ceramics" },
  { id: 4, name: "Jewellery", link: "/products/jewellery" },
  { id: 5, name: "Wooden Crafts", link: "/products/wooden" },
  { id: 6, name: "Clay Items", link: "/products/clay" },
  { id: 7, name: "Handmade Decor", link: "/products/decor" },
];

const Navbar = () => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(2);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check login status on component mount and when token changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = getAuthToken();
      setIsLoggedIn(!!token);
    };

    // Check initial login status
    checkLoginStatus();

    // Listen for login state changes
    window.addEventListener('loginStateChanged', checkLoginStatus);

    // Cleanup event listener
    return () => {
      window.removeEventListener('loginStateChanged', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    // Use the removeAuthToken utility function to clear all tokens
    removeAuthToken();
    
    setIsLoggedIn(false);
    // Dispatch login state change event
    window.dispatchEvent(new Event('loginStateChanged'));
    // Redirect to home page
    navigate('/');
  };

  const handleCategoryClick = (link) => {
    navigate(link);
    setDropdownOpen(false);
  };

  return (
    <div className="relative z-50">
      <div className="shadow-md bg-white dark:bg-slate-800 dark:text-white duration-200">
        <div className="bg-primary/40 py-2">
          <div className="container mx-auto flex justify-between items-center px-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="font-bold text-xl flex gap-1 items-center">
                <FiShoppingBag size="30" />
                HandCraft Store
              </Link>

              <div className="relative group hidden sm:block">
                <input
                  type="text"
                  placeholder="Search Products..."
                  className="w-[200px] group-hover:w-[250px] transition-all duration-300 rounded-lg border border-gray-300 py-1 px-2 text-sm focus:outline-none focus:border-primary dark:border-gray-500 dark:bg-slate-800"
                />
                <IoMdSearch className="text-slate-800 group-hover:text-primary absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer" />
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-6">
              <ul className="flex gap-6">
                {Menu.map((item) => (
                  <li key={item.id}>
                    {item.action ? (
                      <button onClick={item.action} className="hover:text-primary duration-200">
                        {item.name}
                      </button>
                    ) : (
                      <a href={item.link} className="hover:text-primary duration-200">
                        {item.name}
                      </a>
                    )}
                  </li>
                ))}

                <li className="relative">
                  <button
                    className="flex items-center gap-1 hover:text-primary"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    Products <FaCaretDown />
                  </button>
                  {dropdownOpen && (
                    <ul className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-800 shadow-md rounded-lg p-2 z-50">
                      {ProductCategories.map((category) => (
                        <li key={category.id} className="py-1">
                          <button 
                            onClick={() => handleCategoryClick(category.link)} 
                            className="hover:text-primary block px-2 w-full text-left"
                          >
                            {category.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              </ul>

              <Link to="/cart" className="flex items-center gap-2 hover:text-primary">
                <FaShoppingCart /> Cart
              </Link>

              <div
                className="relative cursor-pointer"
                onClick={() => navigate("/Chatbox")}
              >
                <FaBell size="20" className="hover:text-primary" />
                {unreadMessages > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                    {unreadMessages}
                  </span>
                )}
              </div>

              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  <FaSignOutAlt /> Logout
                </button>
              ) : (
                <Link to="/login" className="flex items-center gap-2 hover:text-primary">
                  <FaLock /> Login
                </Link>
              )}

              <Link to="/Adminpanel" className="flex items-center gap-2 hover:text-primary">
                <FaUserShield /> Admin
              </Link>
              <Link to="/Seller" className="flex items-center gap-2 hover:text-primary">
                <FaStore /> Seller
              </Link>

              <DarkMode />
            </div>

            <button className="sm:hidden text-xl" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenu && (
        <div className="sm:hidden bg-white dark:bg-slate-800 p-4 block z-50 absolute w-full left-0 top-full shadow-md">
          <ul className="flex flex-col gap-4">
            {Menu.map((item) => (
              <li key={item.id}>
                {item.action ? (
                  <button onClick={item.action} className="inline-block px-4 hover:text-primary duration-200">
                    {item.name}
                  </button>
                ) : (
                  <a href={item.link} className="inline-block px-4 hover:text-primary duration-200">
                    {item.name}
                  </a>
                )}
              </li>
            ))}

            <li className="px-4">
              <button 
                className="flex items-center gap-1 hover:text-primary mb-2"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                Products <FaCaretDown />
              </button>
              {dropdownOpen && (
                <ul className="pl-4 space-y-2 mt-1">
                  {ProductCategories.map((category) => (
                    <li key={category.id}>
                      <button 
                        onClick={() => {
                          handleCategoryClick(category.link);
                          setMobileMenu(false);
                        }} 
                        className="hover:text-primary block w-full text-left"
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            <li>
              <Link to="/cart" className="flex items-center gap-2 px-4 hover:text-primary">
                <FaShoppingCart /> Cart
              </Link>
            </li>
            {isLoggedIn ? (
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 hover:text-primary w-full"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </li>
            ) : (
              <li>
                <Link to="/login" className="flex items-center gap-2 px-4 hover:text-primary">
                  <FaLock /> Login
                </Link>
              </li>
            )}
            <li>
              <Link to="/Adminpanel" className="flex items-center gap-2 px-4 hover:text-primary">
                <FaUserShield /> Admin
              </Link>
            </li>
            <li>
              <Link to="/Seller" className="flex items-center gap-2 px-4 hover:text-primary">
                <FaStore /> Seller
              </Link>
            </li>

            <li
              className="flex items-center gap-2 px-4 cursor-pointer"
              onClick={() => {
                navigate("/Chatbox");
                setMobileMenu(false);
              }}
            >
              <FaBell />
              Notifications ({unreadMessages})
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
