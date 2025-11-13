import React from 'react';
import Card from '@/components/ui/Card';
import Skeleton from './Skeleton';

const ProductCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden">
      <Skeleton variant="rectangular" height={200} className="w-full" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton variant="text" width={80} />
          <Skeleton variant="rectangular" width={100} height={36} />
        </div>
      </div>
    </Card>
  );
};

export default ProductCardSkeleton;

