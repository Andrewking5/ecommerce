import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Truck } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container-apple">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="heading-1 mb-6">
              Discover Amazing Products
            </h1>
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              Experience the future of online shopping with our curated collection 
              of premium products designed for the modern lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  Shop Now
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-apple">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Why Choose Us</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              We're committed to providing the best shopping experience with 
              quality products and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="text-brand-blue" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-4">Premium Quality</h3>
              <p className="text-text-secondary">
                Every product is carefully selected and tested to ensure 
                the highest quality standards.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="text-brand-green" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure Shopping</h3>
              <p className="text-text-secondary">
                Your data and payments are protected with industry-leading 
                security measures.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Truck className="text-brand-blue" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-4">Fast Delivery</h3>
              <p className="text-text-secondary">
                Get your orders delivered quickly with our reliable 
                shipping partners.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-apple">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="heading-2 mb-6">Ready to Start Shopping?</h2>
            <p className="text-lg text-text-secondary mb-8">
              Join thousands of satisfied customers and discover products 
              that enhance your lifestyle.
            </p>
            <Link to="/products">
              <Button size="lg">
                Browse Products
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;


