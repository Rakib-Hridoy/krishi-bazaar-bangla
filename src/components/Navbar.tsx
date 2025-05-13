
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-agriculture-green-dark text-white py-4 px-4 md:px-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white">
          কৃষি বাজার
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-white hover:text-agriculture-cream">
            হোম
          </Link>
          <Link to="/#categories" className="text-white hover:text-agriculture-cream">
            ক্যাটাগরি
          </Link>
          <Link to="/#how-it-works" className="text-white hover:text-agriculture-cream">
            কিভাবে কাজ করে
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white text-agriculture-green-dark border-agriculture-green-dark hover:bg-agriculture-cream">
                  {user?.name.split(' ')[0]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white">
                <DropdownMenuItem>
                  <Link to="/dashboard" className="w-full">ড্যাশবোর্ড</Link>
                </DropdownMenuItem>
                {user?.role === 'seller' && (
                  <DropdownMenuItem>
                    <Link to="/create-listing" className="w-full">নতুন পণ্য যোগ করুন</Link>
                  </DropdownMenuItem>
                )}
                {user?.role === 'admin' && (
                  <DropdownMenuItem>
                    <Link to="/admin" className="w-full">অ্যাডমিন প্যানেল</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Link to={`/profile/${user?.id}`} className="w-full">প্রোফাইল</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <span className="w-full">লগ আউট</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
              <Button asChild variant="outline" className="bg-white text-agriculture-green-dark border-agriculture-green-dark hover:bg-agriculture-cream">
                <Link to="/login">লগইন</Link>
              </Button>
              <Button asChild className="bg-agriculture-amber text-white hover:bg-amber-600">
                <Link to="/register">রেজিস্টার</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <span className="text-2xl">✕</span>
          ) : (
            <span className="text-2xl">☰</span>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden container mx-auto mt-4 pb-4 flex flex-col space-y-4">
          <Link 
            to="/" 
            className="text-white hover:text-agriculture-cream"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            হোম
          </Link>
          <Link 
            to="/#categories" 
            className="text-white hover:text-agriculture-cream"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ক্যাটাগরি
          </Link>
          <Link 
            to="/#how-it-works" 
            className="text-white hover:text-agriculture-cream"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            কিভাবে কাজ করে
          </Link>

          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                className="text-white hover:text-agriculture-cream"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ড্যাশবোর্ড
              </Link>
              {user?.role === 'seller' && (
                <Link 
                  to="/create-listing" 
                  className="text-white hover:text-agriculture-cream"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  নতুন পণ্য যোগ করুন
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="text-white hover:text-agriculture-cream"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  অ্যাডমিন প্যানেল
                </Link>
              )}
              <Link 
                to={`/profile/${user?.id}`} 
                className="text-white hover:text-agriculture-cream"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                প্রোফাইল
              </Link>
              <button 
                className="text-white hover:text-agriculture-cream text-left"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
              >
                লগ আউট
              </button>
            </>
          ) : (
            <div className="flex space-x-2">
              <Button 
                asChild 
                variant="outline" 
                className="bg-white text-agriculture-green-dark border-agriculture-green-dark hover:bg-agriculture-cream"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link to="/login">লগইন</Link>
              </Button>
              <Button 
                asChild 
                className="bg-agriculture-amber text-white hover:bg-amber-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link to="/register">রেজিস্টার</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
