"use client";
import { use, useEffect, useState } from "react";
import { formatedDate } from "@/utils/sharedFunction";
import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { getAllGenres } from "@/services/newsService";
import { useUser } from "../context/userContext";

export default function Navbar() {
  const { user, logout } = useUser();
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<any>([]);
  const router = useRouter();

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      // Redirect to /search-result with the query as a URL parameter
      router.push(`/search-result?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Fetch categories
  useEffect(() => {
    getAllGenres().then((data) => {
      setCategories(data);
    });
  }, []);

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
            <Link href={"/login"}>
              <button className="bg-black text-white px-3 py-1">Login</button>
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
                onClick={logout}
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
            {categories.map((category: any, index: number) => (
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
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
