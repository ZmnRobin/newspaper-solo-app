"use client";
import { use, useEffect, useState } from "react";
import { formatedDate } from "@/utils/sharedFunction";
import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { getAllGenres } from "@/services/newsService";

export default function Navbar() {
  const [showSearch, setShowSearch] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any>([]);
  const router = useRouter();

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  // Check for user login state
  useEffect(() => {
    const userData = Cookies.get("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Listen for login event
    const handleLogin = () => {
      const updatedUserData = Cookies.get("user");
      if (updatedUserData) {
        setUser(JSON.parse(updatedUserData));
      }
    };

    window.addEventListener("userLoggedIn", handleLogin);

    return () => {
      window.removeEventListener("userLoggedIn", handleLogin);
    };
  }, []);

  // Fetch categories
  useEffect(() => {
    getAllGenres().then((data) => {
      setCategories(data);
    });
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="container mx-auto">
      <div className="flex justify-between items-center py-2 px-4 bg-white">
        <div className="text-xs text-gray-500">{formatedDate(new Date())}</div>
        <div className="text-center flex-grow">
          <Link href={"/"}>
            <h1 className="text-5xl font-serif">The Newspaper</h1>
          </Link>
        </div>
        <div className="w-20 flex items-center justify-end">
          {!user ? (
            <Link href={"/signup"}>
              <button className="bg-black text-white px-3 py-1">Sign Up</button>
            </Link>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/profile">{user.name}</Link>
              <Link href="/create-article">
                <button className="bg-blue-600 text-white px-3 py-1">
                  Create
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 py-1"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="flex justify-center items-center py-2 px-4">
          <div className="flex space-x-4 m-1">
            {categories.map((category:any, index:number) => (
              <Link
                key={index}
                href={`/genre/${category.id}`}
                className="text-gray-700 hover:text-gray-900"
              >
                {category.name}
              </Link>
            ))}
          </div>
          <div>
            <button onClick={toggleSearch} className="ml-6 mt-2">
              <FaSearch color="gray" />
            </button>
          </div>
        </div>
        {showSearch && (
          <div className="flex justify-center w-full bg-white m-2 px-10">
            <input
              type="text"
              placeholder="Search articles here ..."
              className="w-9/12 p-2 text-sm border border-gray-800 focus:ring-0"
            />
            <button
              className="text-4xl ml-4"
              onClick={() => setShowSearch(false)}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
