import React from "react";
import { FiShoppingBag } from "react-icons/fi";
import { FaMapLocationDot } from "react-icons/fa6";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { IoChatbubblesSharp } from "react-icons/io5";

const Footer = () => {
  return (
    <footer id="footer" className="text-white bg-[#212529]">
      <div className="container">
        <div data-aos="zoom-in" className="grid md:grid-cols-3 pb-20 pt-5">
          {/* Company Details */}
          <div className="py-8 px-4">
            <h1 className="sm:text-3xl text-xl font-bold flex items-center gap-1 mb-3">
              <FiShoppingBag size="30" />
              HandCraft Store
            </h1>
            <p>
              Explore a wide range of handcrafted products made by skilled
              artisans. Our collection includes home decor, accessories, gifts,
              and more – all crafted with love and creativity.
            </p>
          </div>

          {/* Chat With Us */}
          <div className="py-8 px-4">
            <h1 className="sm:text-xl text-xl font-bold mb-3 flex items-center gap-2">
              <IoChatbubblesSharp size="24" />
              Chat With Us
            </h1>
            <p>
              Need help? Our support team is available to assist you with your
              orders and inquiries.
            </p>
            <a
              href="#"
              className="mt-3 inline-block bg-primary px-4 py-2 text-white rounded-md hover:bg-opacity-80 transition"
            >
              Start Chat
            </a>
          </div>

          {/* Social & Contact Info */}
          <div className="py-8 px-4">
            <h1 className="sm:text-xl text-xl font-bold mb-3">Contact Us</h1>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Instagram">
                <FaInstagram className="text-3xl hover:text-primary transition" />
              </a>
              <a href="#" aria-label="Facebook">
                <FaFacebook className="text-3xl hover:text-primary transition" />
              </a>
              <a href="#" aria-label="LinkedIn">
                <FaLinkedin className="text-3xl hover:text-primary transition" />
              </a>
            </div>
            <div className="mt-6">
              <div className="flex items-center gap-3">
                <FaMapLocationDot />
                <p>ict, kerala</p>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <IoCall />
                <p>+91 2255 </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center py-4 border-t border-gray-700">
          <p>© 2025 HandCraft Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
