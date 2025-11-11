import React from 'react';
import { useAuthStore } from '@/store/authStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { User, Mail, Phone, Calendar } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="container-apple py-12">
        <div className="text-center">
          <h2 className="heading-2 mb-4">Please log in to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container-apple py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="heading-1 mb-8">My Profile</h1>

        <Card className="p-8">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={32} className="text-gray-500" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-text-secondary">{user.role}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Mail size={20} className="text-text-tertiary" />
              <div>
                <p className="text-sm text-text-tertiary">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center space-x-4">
                <Phone size={20} className="text-text-tertiary" />
                <div>
                  <p className="text-sm text-text-tertiary">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <Calendar size={20} className="text-text-tertiary" />
              <div>
                <p className="text-sm text-text-tertiary">Member since</p>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Button variant="outline" className="w-full">
              Edit Profile
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;


