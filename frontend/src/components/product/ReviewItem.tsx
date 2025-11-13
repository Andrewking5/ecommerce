import React from 'react';
import { Review } from '@/services/reviews';
import { Star, ThumbsUp, CheckCircle } from 'lucide-react';
import { reviewApi } from '@/services/reviews';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/utils/imageUrl';

interface ReviewItemProps {
  review: Review;
  onHelpful: () => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review, onHelpful }) => {
  const handleHelpful = async () => {
    try {
      await reviewApi.markHelpful(review.id);
      toast.success('Thank you for your feedback!');
      onHelpful();
    } catch (error) {
      toast.error('Failed to mark as helpful');
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            {review.user?.avatar ? (
              <img
                src={getImageUrl(review.user.avatar)}
                alt={review.user.firstName}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <span className="text-gray-600 font-medium">
                {review.user?.firstName?.[0] || 'U'}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium">
                {review.user?.firstName} {review.user?.lastName}
              </p>
              {review.isVerified && (
                <CheckCircle size={16} className="text-green-500" />
              )}
            </div>
            <p className="text-sm text-gray-600">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              className={
                star <= review.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }
            />
          ))}
        </div>
      </div>

      {review.comment && (
        <p className="text-gray-700 mb-4">{review.comment}</p>
      )}

      {review.images && review.images.length > 0 && (
        <div className="flex space-x-2 mb-4">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={getImageUrl(image)}
              alt={`Review image ${index + 1}`}
              className="w-20 h-20 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      <div className="flex items-center space-x-4">
        <button
          onClick={handleHelpful}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ThumbsUp size={16} />
          <span>Helpful ({review.helpfulCount})</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewItem;

