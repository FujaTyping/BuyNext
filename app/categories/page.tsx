"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductGrid from '../components/ProductGrid';
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

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('c');

    const [data, setData] = useState<MarketItem[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (query) {
            const fetchData = async () => {
                setLoading(true);
                setError(null);
                try {
                    const response = await axios.get(`/api/categories?c=${query}`);
                    if (response.status === 200) {
                        setData(response.data);
                    } else {
                        setError(`Failed to fetch search results (status: ${response.status})`);
                    }
                } catch (err) {
                    console.error("Error fetching search results:", err);
                    setError("An error occurred while fetching search results. Please try again.");
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [query]);

    return (
        <main className="max-w-7xl mx-auto py-10">
            <div className='mx-4 flex items-center place-content-between pb-6'>
                <p>Search Results for: <span className="text-blue-600 font-bold">{`"${query || "..."}"`}</span></p>
                {!loading && !error && data && (
                    <p>Found {data.length} item{data.length !== 1 ? 's' : ''}</p>
                )}
            </div>
            {loading && (
                <div className="flex justify-center items-center py-52">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-l-3 border-blue-500"></div>
                </div>
            )}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {!loading && !error && <ProductGrid data={data} />}
        </main>
    );
}