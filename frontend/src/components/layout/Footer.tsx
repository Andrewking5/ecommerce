import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container-apple py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-semibold text-text-primary">Store</span>
            </div>
            <p className="text-text-secondary text-sm">
              Modern e-commerce platform with Apple-inspired design. 
              Quality products for the modern lifestyle.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm"
                >
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-text-tertiary text-sm">
            © 2024 E-commerce Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


