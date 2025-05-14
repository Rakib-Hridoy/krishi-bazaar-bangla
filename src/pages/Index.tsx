
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CategoryButton from '@/components/CategoryButton';
import ProductCard from '@/components/ProductCard';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchInputValue, setSearchInputValue] = useState('');

  const categories = [
    { id: 'all', name: 'সব', icon: '🌾' },
    { id: 'শস্য', name: 'শস্য', icon: '🌾' },
    { id: 'সবজি', name: 'সবজি', icon: '🥬' },
    { id: 'ফল', name: 'ফল', icon: '🍎' },
    { id: 'দুগ্ধজাত', name: 'দুগ্ধজাত', icon: '🥛' },
    { id: 'মাংস', name: 'মাংস', icon: '🍗' },
  ];

  const { products, isLoading } = useProducts(activeCategory, searchQuery);

  const handleSearch = () => {
    setSearchQuery(searchInputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-agriculture-green-dark to-agriculture-green-light text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                কৃষি পণ্য কেনা-বেচার সবচেয়ে সরল প্ল্যাটফর্ম
              </h1>
              <p className="text-lg mb-6">
                আপনার কৃষি পণ্য সরাসরি বিক্রি করুন অথবা সরাসরি কৃষকের কাছ থেকে কিনুন। মধ্যস্বত্ববোগি মুক্ত বাজার ব্যবস্থা।
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Button asChild className="bg-white text-agriculture-green-dark hover:bg-agriculture-cream">
                  <Link to="/register?role=seller">কৃষক হিসেবে যোগ দিন</Link>
                </Button>
                <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-agriculture-green-dark">
                  <Link to="/register?role=buyer">ক্রেতা হিসেবে যোগ দিন</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1465379944081-7f47de8d74ac" 
                alt="কৃষক" 
                className="rounded-lg shadow-lg max-w-full h-auto"
                style={{ maxHeight: "400px" }}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Search Section */}
      <section className="py-8 px-4 bg-agriculture-cream">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <Input
              type="text"
              placeholder="পণ্য, অবস্থান খুঁজুন..."
              className="md:flex-1"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button 
              className="bg-agriculture-amber hover:bg-amber-600 text-white"
              onClick={handleSearch}
            >
              খুঁজুন
            </Button>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section id="categories" className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">ক্যাটাগরি</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryButton
                key={category.id}
                name={category.name}
                icon={category.icon}
                isActive={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Products Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-6">সাম্প্রতিক পণ্যসমূহ</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-xl">পণ্য লোড হচ্ছে...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl">কোন পণ্য পাওয়া যায়নি!</p>
              <Button 
                className="mt-4 bg-agriculture-green-dark hover:bg-agriculture-green-light"
                onClick={() => {
                  setSearchQuery('');
                  setSearchInputValue('');
                  setActiveCategory('all');
                }}
              >
                সকল ক্যাটাগরি দেখুন
              </Button>
            </div>
          )}
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-10 text-center">কিভাবে কাজ করে</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-agriculture-green-dark text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">রেজিস্ট্রেশন করুন</h3>
              <p>কৃষক বা ক্রেতা হিসেবে আপনার অ্যাকাউন্ট তৈরি করুন।</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-agriculture-green-dark text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">{`পণ্য প্রকাশ বা ব্রাউজ করুন`}</h3>
              <p>কৃষক হিসেবে আপনার পণ্য প্রকাশ করুন বা ক্রেতা হিসেবে পণ্য খুঁজুন।</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-agriculture-green-dark text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">লেনদেন সম্পন্ন করুন</h3>
              <p>বিড করুন, যোগাযোগ করুন এবং সরাসরি লেনদেন করুন।</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-12 px-4 bg-agriculture-cream">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-10 text-center">আমাদের ব্যবহারকারীরা যা বলেন</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="mb-4">
                "কৃষি বাজার আমার পণ্য বিক্রির জন্য সবচেয়ে ভালো প্ল্যাটফর্ম। আগে দালালরা আমার পণ্য কম দামে কিনে বেশি দামে বিক্রি করত, এখন আমি সরাসরি বিক্রি করি।"
              </p>
              <p className="font-bold">- জসিম উদ্দীন, কৃষক</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="mb-4">
                "খুব সহজেই কৃষকের কাছ থেকে টাটকা সবজি কিনতে পারি। দাম কম এবং পণ্য মানসম্মত।"
              </p>
              <p className="font-bold">- নাজিয়া খাতুন, ক্রেতা</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="mb-4">
                "আমার চালের ব্যবসায় এই প্ল্যাটফর্ম অনেক সাহায্য করেছে। এখন দেশের যেকোনো প্রান্ত থেকে ভালো মানের চাল সংগ্রহ করতে পারি।"
              </p>
              <p className="font-bold">- রহমত আলী, পাইকার</p>
            </div>
          </div>
        </div>
      </section>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
