"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from "motion/react"
import Notfound from "@/assets/NoProduct.svg"

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

interface ProductGridProps {
    data: MarketItem[] | null;
}

const ProductGrid: React.FC<ProductGridProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <>
                <div className='flex items-center justify-center flex-col gap-4 py-16'>
                    <img src={Notfound.src} className='max-w-[300px]' alt="Notfound" />
                    <div>
                        <p className='font-bold text-2xl text-center'>No Products Found</p>
                        <p className='text-center mt-2'>Please try again later or check back soon for new items.</p>
                    </div>
                </div>
            </>
        )
    }

    return (
        <div className="grid 
            grid-cols-2
            md:grid-cols-3 
            lg:grid-cols-4 
            xl:grid-cols-5 gap-4 md:gap-6 px-4">
            {data.map((item) => (
                <motion.div
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    whileTap={{ scale: 0.95 }}
                    key={item.id}
                    className="flex flex-col"
                >
                    <Link href={`/product?id=${item.id}`} className="flex flex-col h-full">
                        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                            <img
                                src={item.img}
                                alt={item.title}
                                className="w-full aspect-square object-cover" // Changed from h-48
                            />
                            <div className="p-4 flex flex-col flex-grow">
                                <h2 className="text-lg font-semibold mb-2 truncate" title={item.title}>{item.title}</h2>
                                <p className="text-sm text-gray-600 mb-3 h-12 overflow-hidden" title={item.desc}>
                                    {item.desc.length > 40
                                        ? `${item.desc.substring(0, 40)}...`
                                        : item.desc}
                                </p>
                                <div className="mt-auto flex flex-col md:flex-row items-center justify-between pt-2">
                                    <p className="text-xl font-bold text-blue-600 mb-1 md:mb-0">${item.price.toFixed(2)}</p>
                                    <p className={`text-xs font-semibold rounded-full text-white py-1 px-3 ${item.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                                        {item.stock > 0
                                            ? `In Stock`
                                            : "Out of Stock"
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
};

export default ProductGrid;
