
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-agriculture-green-dark">কৃষি বাজার</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link to="/" className="text-gray-700 hover:text-agriculture-green-dark">
              হোম
            </Link>
            <Link to="/#categories" className="text-gray-700 hover:text-agriculture-green-dark">
              ক্যাটাগরি
            </Link>
            <Link to="/#how-it-works" className="text-gray-700 hover:text-agriculture-green-dark">
              কিভাবে কাজ করে
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <Button variant="ghost" className="flex items-center">
                    {profile?.name || user?.email}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 invisible group-hover:visible z-10">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ড্যাশবোর্ড
                    </Link>
                    <Link
                      to={`/profile/${user?.id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      প্রোফাইল
                    </Link>
                    {profile?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        অ্যাডমিন প্যানেল
                      </Link>
                    )}
                    <button
                      onClick={() => logout()}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      লগআউট
                    </button>
                  </div>
                </div>
                
                {profile?.role === 'seller' && (
                  <Link to="/create-listing">
                    <Button className="bg-agriculture-green-dark hover:bg-agriculture-green-light">
                      পণ্য যোগ করুন
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login">
                  <Button variant="outline">লগইন</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-agriculture-green-dark hover:bg-agriculture-green-light">
                    রেজিস্টার
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-agriculture-green-dark hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-agriculture-green-dark hover:bg-gray-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            হোম
          </Link>
          <Link
            to="/#categories"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-agriculture-green-dark hover:bg-gray-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            ক্যাটাগরি
          </Link>
          <Link
            to="/#how-it-works"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-agriculture-green-dark hover:bg-gray-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            কিভাবে কাজ করে
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-agriculture-green-dark hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                ড্যাশবোর্ড
              </Link>
              <Link
                to={`/profile/${user?.id}`}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-agriculture-green-dark hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                প্রোফাইল
              </Link>
              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-agriculture-green-dark hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  অ্যাডমিন প্যানেল
                </Link>
              )}
              {profile?.role === 'seller' && (
                <Link
                  to="/create-listing"
                  className="block px-3 py-2 rounded-md text-base font-medium text-agriculture-green-dark hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  পণ্য যোগ করুন
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-agriculture-green-dark hover:bg-gray-50"
              >
                লগআউট
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-agriculture-green-dark hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                লগইন
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md text-base font-medium text-agriculture-green-dark hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                রেজিস্টার
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
