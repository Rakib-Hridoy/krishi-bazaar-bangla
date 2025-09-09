
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-agriculture-green-dark text-white py-8 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold mb-4">AgroBid</h2>
            <p className="max-w-xs">বাংলাদেশের কৃষকদের জন্য সরাসরি বিপণন প্ল্যাটফর্ম। সিন্ডিকেট মুক্ত কৃষি পণ্য বিক্রয় করুন এবং কিনুন।</p>
          </div>
          
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-3">কুইক লিংক</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-agriculture-cream">হোম</Link></li>
              <li><Link to="/#categories" className="hover:text-agriculture-cream">ক্যাটাগরি</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-agriculture-cream">কিভাবে কাজ করে</Link></li>
              <li><Link to="/login" className="hover:text-agriculture-cream">লগইন</Link></li>
              <li><Link to="/register" className="hover:text-agriculture-cream">রেজিস্টার</Link></li>
            </ul>
          </div>
          
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-3">যোগাযোগ</h3>
            <ul className="space-y-2">
              <li>ইমেইল: info@krishibazar.com</li>
              <li>ফোন: +880 1234-567890</li>
              <li>ঠিকানা: মতিঝিল, ঢাকা, বাংলাদেশ</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-500 mt-8 pt-6">
          <p className="text-center">&copy; {new Date().getFullYear()} AgroBid। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  );
}
