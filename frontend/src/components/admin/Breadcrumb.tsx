import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const location = useLocation();

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6">
      <Link
        to="/admin"
        className="flex items-center text-text-secondary hover:text-text-primary transition-colors"
      >
        <Home size={16} />
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={16} className="text-text-tertiary" />
          {item.path && index < items.length - 1 ? (
            <Link
              to={item.path}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={`${index === items.length - 1 ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;

