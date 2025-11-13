import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Star, Shield, Truck } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/common/ProductCardSkeleton';
import { productApi } from '@/services/products';

const Home: React.FC = () => {
  const { t } = useTranslation(['common', 'products']);
  // 获取热门商品
  const { data: featuredProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productApi.getProducts({ page: 1, limit: 8, sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  // 获取分类
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productApi.getCategories(),
  });

  return (
    <main className="min-h-screen" aria-label={t('common:home.title', { defaultValue: 'Home' })}>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20" aria-labelledby="hero-title">
        <div className="container-apple">
          <div className="text-center max-w-4xl mx-auto">
            <h1 id="hero-title" className="heading-1 mb-6">
              {t('common:hero.title')}
            </h1>
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              {t('common:hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  {t('common:buttons.shopNow')}
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t('common:buttons.learnMore')}
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
            <h2 className="heading-2 mb-4">{t('common:features.title')}</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              {t('common:features.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="text-brand-blue" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('common:features.premiumQuality.title')}</h3>
              <p className="text-text-secondary">
                {t('common:features.premiumQuality.description')}
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="text-brand-green" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('common:features.secureShopping.title')}</h3>
              <p className="text-text-secondary">
                {t('common:features.secureShopping.description')}
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Truck className="text-brand-blue" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('common:features.fastDelivery.title')}</h3>
              <p className="text-text-secondary">
                {t('common:features.fastDelivery.description')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts && featuredProducts.products && featuredProducts.products.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container-apple">
            <div className="text-center mb-16">
              <h2 className="heading-2 mb-4">{t('products:featured')}</h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                {t('products:featuredDescription')}
              </p>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {featuredProducts.products.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            <div className="text-center">
              <Link to="/products">
                <Button variant="outline" size="lg">
                  {t('common:buttons.viewAll')}
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {categories && categories.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container-apple">
            <div className="text-center mb-16">
              <h2 className="heading-2 mb-4">{t('products:categories')}</h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                {t('products:categoriesDescription')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category) => (
                <Link key={category.id} to={`/products?category=${category.slug}`}>
                  <Card hover className="p-6 text-center group">
                    {category.image ? (
                      <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-gray-100">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square rounded-xl bg-gray-100 mb-4 flex items-center justify-center">
                        <span className="text-4xl text-text-tertiary">
                          {category.name[0]}
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-text-primary group-hover:text-brand-blue transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container-apple">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="heading-2 mb-6">{t('common:cta.title')}</h2>
            <p className="text-lg text-text-secondary mb-8">
              {t('common:cta.description')}
            </p>
            <Link to="/products">
              <Button size="lg">
                {t('common:buttons.browseProducts')}
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;


