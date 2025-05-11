"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import axios from "axios";
import ProductGrid from "./components/ProductGrid";
import C1 from "@/assets/C1.png"
import C2 from "@/assets/C2.png"
import C3 from "@/assets/C3.png"
import C4 from "@/assets/C4.png"
import C5 from "@/assets/C5.png"
import C6 from "@/assets/C6.png"
import C7 from "@/assets/C7.png"
import C8 from "@/assets/C8.png"
import C9 from "@/assets/C9.png"
import Link from "next/link";

interface MarketItem {
  id: string;
  stock: number;
  desc: string;
  nameseller: string;
  img: string;
  uid: string;
  rating: number;
  imgseller: string;
  title: string;
  price: number;
  createdAt: string;
  category: string;
}

const categories = [
  { name: "Music Products", icon: C1.src, alt: "Musical instruments and accessories", url: "/categories?c=music" },
  { name: "Drinks", icon: C2.src, alt: "Beverages and drinks", url: "/categories?c=drink" },
  { name: "Women's Fashion", icon: C3.src, alt: "Women's clothing and apparel", url: "/categories?c=women" },
  { name: "Jewelry", icon: C4.src, alt: "Necklaces, rings, and bracelets", url: "/categories?c=jewelry" },
  { name: "Bags & Luggage", icon: C5.src, alt: "Handbags, backpacks, and luggage", url: "/categories?c=bag" },
  { name: "Men's Fashion", icon: C6.src, alt: "Men's clothing and apparel", url: "/categories?c=men" },
  { name: "Furniture", icon: C7.src, alt: "Home and office furniture", url: "/categories?c=furniture" },
  { name: "Beauty & Makeup", icon: C8.src, alt: "Cosmetics and makeup products", url: "/categories?c=makeup" },
  { name: "Tech & Gadgets", icon: C9.src, alt: "Electronics and tech gadgets", url: "/categories?c=tech" },
];

interface Category {
  name: string;
  icon: string;
  alt: string;
}

interface CategoryItemProps {
  category: Category;
}

export default function Home() {
  const [data, setData] = useState<MarketItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/market");
        if (response.status == 200) {
          setData(response.data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const CategoryItem: React.FC<CategoryItemProps> = ({ category }) => (
    <button className="flex flex-col items-center justify-start w-full p-3 text-center transition-all duration-200 ease-in-out rounded-lg hover:bg-gray-100 active:bg-gray-200 group">
      <div className="flex items-center justify-center w-16 h-16 p-1 mb-2 overflow-hidden transition-transform duration-200 ease-in-out rounded-full bg-gray-50 group-hover:scale-105">
        <img src={category.icon} alt={category.alt} className="object-contain w-full h-full" />
      </div>
      <h1 className="text-xs font-medium text-gray-700 sm:text-sm group-hover:text-blue-600">{category.name}</h1>
    </button>
  );

  return (
    <>
      <main className="max-w-7xl mx-auto py-14">
        <div>
          <p className="mb-3 px-4">Categories</p>
          <Swiper
            spaceBetween={10}
            slidesPerView={3}
            breakpoints={{
              480: {
                slidesPerView: 4,
                spaceBetween: 10,
              },
              640: {
                slidesPerView: 5,
                spaceBetween: 15,
              },
              1024: {
                slidesPerView: 7,
                spaceBetween: 15,
              },
            }}
            className="mb-12"
          >
            {categories.map((category, index) => (
              <SwiperSlide key={index}>
                <Link href={`${category.url}`} className="cursor-pointer">
                  <CategoryItem category={category} />
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div>
          {loading ? (
            <>
              <div className="flex justify-center items-center py-52">
                <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-l-3 border-blue-500"></div>
              </div>
            </>
          ) : <>
            <p className="mb-3 px-4">Product</p>
            <ProductGrid data={data} />
          </>}
        </div>
      </main>
    </>
  );
}
