"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { motion } from "motion/react"
import { getAuth, User } from 'firebase/auth';
import { toast } from 'react-toastify';

interface Product {
    id: string;
    title: string;
    desc: string;
    img: string;
    price: number;
    rating: number;
    stock: number;
    uid: string;
    nameseller: string;
    imgseller: string;
    category: string;
    createdAt: string;
}

export default function ProductPage() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const handleAddToCart = async () => {
        if (!product) return;

        if (!currentUser) {
            toast("Please login to add items to cart");
            return;
        }

        try {
            const payload = {
                uid: currentUser.uid,
                items: [
                    {
                        productId: product.id,
                        quantity: 1
                    }
                ]
            };

            const response = await fetch('/api/user/inventory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to add to cart');
            }

            toast.success('Successfully added to cart!', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add to cart. Please try again.', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
    };

    useEffect(() => {
        const auth = getAuth();
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
        });

        if (id) {
            const fetchProduct = async () => {
                setLoading(true);
                setError(null);
                try {
                    const response = await axios.get(`/api/market/product?id=${id}`);
                    setProduct(response.data);
                } catch (err) {
                    console.error('Error fetching product:', err);
                    setError('Failed to load product details. Please try again.');
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        } else {
            setProduct(null);
            setError('No product ID provided.');
            setLoading(false);
        }

        return () => {
            unsubscribeAuth();
        };
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-52">
                <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-l-3 border-blue-500"></div>
            </div>
        );
    }

    if (error && !product) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                <p>{error}</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <h1 className="text-2xl font-bold">Product not found</h1>
                {id && <p className="text-gray-500">Could not find product with ID: {id}</p>}
                {!id && <p className="text-gray-500">Please provide a product ID in the URL (e.g., /product?id=your_id_here).</p>}
            </div>
        );
    }

    let addToCartButtonText = 'Add to Cart';
    let isAddToCartDisabled = false;

    if (product.stock === 0) {
        addToCartButtonText = 'Out of Stock';
        isAddToCartDisabled = true;
    } else if (!currentUser) {
        addToCartButtonText = 'Login to Add to Cart';
        isAddToCartDisabled = true;
    }
    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="rounded-lg overflow-hidden shadow-lg">
                    <PhotoProvider
                        maskOpacity={0.5}
                        bannerVisible={false}>
                        <PhotoView src={product.img}>
                            <img
                                src={product.img}
                                alt={product.title}
                                className="w-full h-auto object-cover aspect-square cursor-pointer"
                            />
                        </PhotoView>
                    </PhotoProvider>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold mb-3 text-gray-800">{product.title}</h1>
                    <div className="flex items-center mb-4">
                        <span className="text-yellow-500 mr-2">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
                        <span className="text-sm text-gray-600">({product.rating.toFixed(1)} rating)</span>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">{product.desc}</p>
                    <div className="flex items-baseline mb-6">
                        <p className="text-3xl font-bold text-blue-600">${product.price.toFixed(2)}</p>
                        <span className={`px-3 py-1 rounded-full text-md font-semibold`}>
                            / {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                        </span>
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.025 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <button
                            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-150 ${product.stock > 0 ? 'bg-blue-500' : 'bg-gray-400 cursor-not-allowed'
                                } ${!currentUser && product.stock > 0 ? 'bg-gray-400 cursor-not-allowed' : ''}`} // Style for login prompt
                            disabled={isAddToCartDisabled}
                            onClick={handleAddToCart}
                        >
                            {addToCartButtonText}
                        </button>
                    </motion.div>

                    <div className="border-t pt-6 mt-6">
                        <p className="text-sm text-gray-500 mb-2">Sold by:</p>
                        <div className="flex items-center">
                            <img
                                src={product.imgseller}
                                alt={product.nameseller}
                                className="w-12 h-12 rounded-full mr-4 border-2 border-gray-200"
                            />
                            <div>
                                <p className="font-semibold text-gray-800">{product.nameseller}</p>
                                <p className="text-xs text-gray-500">Category: {product.category}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}