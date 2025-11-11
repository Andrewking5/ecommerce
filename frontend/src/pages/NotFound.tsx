import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="heading-2 mb-4">Page Not Found</h2>
          <p className="text-text-secondary mb-8">
            Sorry, we couldn't find the page you're looking for. 
            It might have been moved or doesn't exist.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/">
            <Button size="lg" className="w-full">
              <Home size={20} className="mr-2" />
              Go Home
            </Button>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-gray-900 hover:bg-gray-50 transition-colors duration-200"
          >
            <ArrowLeft size={20} className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;


