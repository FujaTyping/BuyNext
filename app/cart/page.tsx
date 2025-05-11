"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import Modal from 'react-modal';
import ReqLog from "@/assets/RequireLogin.svg"
import { toast } from 'react-toastify';

interface MarketItem {
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

interface CartItem extends MarketItem {
    quantity: number;
}

interface OrderItem {
    [productId: string]: number;
}

interface OrderAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
}

interface OrderData {
    uid: string;
    items: OrderItem;
    address: OrderAddress;
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered';
    createdAt: string;
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [address, setAddress] = useState<OrderAddress>({
        street: '',
        city: '',
        state: '',
        zipCode: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '500px',
            width: '90%'
        },
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        setIsSubmitting(true);
        try {
            const items: OrderItem = cartItems.reduce((acc, item) => {
                acc[item.id] = item.quantity;
                return acc;
            }, {} as OrderItem);

            const orderData: OrderData = {
                uid: user.uid,
                items,
                address,
                totalAmount: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            await axios.post('/api/order', orderData);

            await Promise.all(
                cartItems.map(async (item) => {
                    await axios.put(`/api/market/product/?id=${item.id}`, {
                        quantity: item.quantity
                    });

                    return axios.delete(`/api/user/inventory?uid=${user.uid}&productId=${item.id}`);
                })
            );

            setCartItems([]);
            setIsOpen(false);
            router.push('/user');
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Failed to place order', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQuantityChange = async (productId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        try {
            await axios.put(`/api/user/inventory?uid=${user.uid}&productId=${productId}`, {
                quantity: newQuantity
            });

            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === productId ? { ...item, quantity: newQuantity } : item
                )
            );
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const handleDeleteItem = async (productId: string) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        try {
            await axios.delete(`/api/user/inventory?uid=${user.uid}&productId=${productId}`);
            setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
            toast.success('Item removed from cart', {
                position: "bottom-right",
                autoClose: 3000,
            });
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error('Failed to remove item', {
                position: "bottom-right",
                autoClose: 3000,
            });
        }
    };

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
            if (user) {
                try {
                    setLoading(true);
                    setError(null);

                    const inventoryResponse = await axios.get(`/api/user/inventory?uid=${user.uid}`);
                    const { inventory } = inventoryResponse.data;

                    if (Object.keys(inventory).length === 0) {
                        setCartItems([]);
                        setLoading(false);
                        return;
                    }

                    const items = await Promise.all(
                        Object.entries(inventory).map(async ([productId, quantity]) => {
                            const productResponse = await axios.get(`/api/market/product?id=${productId}`);
                            return {
                                ...productResponse.data,
                                id: productId,
                                quantity
                            };
                        })
                    );
                    setCartItems(items);
                } catch (err) {
                    console.error('Error fetching cart items:', err);
                    setError('Failed to load cart items');
                } finally {
                    setLoading(false);
                }
            } else {
                setError("Please login to view your cart");
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-52">
                <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-l-3 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex items-center justify-center flex-col gap-4 py-24'>
                <img src={ReqLog.src} className='max-w-[300px]' alt="Notfound" />
                <div className='flex flex-col items-center justify-center'>
                    <p className='font-bold text-2xl text-center'>Oh dear! It seems {"we've"} encountered a little hiccup.</p>
                    <p className='text-center mt-2'>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 py-10">
            <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

            {cartItems.length === 0 ? (
                <p className="text-center py-10">Your cart is empty</p>
            ) : (
                <>
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex items-start border border-gray-300 rounded-lg p-4 gap-4">
                                <div className="w-20 h-20 relative">
                                    <img
                                        src={item.img}
                                        alt={item.title}
                                        className="w-full h-full object-cover rounded"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/placeholder.png';
                                        }}
                                    />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between">
                                        <h3 className="font-semibold">{item.title}</h3>
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            aria-label="Delete item"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 py-1">
                                        <button
                                            className="px-2 border rounded"
                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            className="px-2 border rounded"
                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                            disabled={item.quantity >= item.stock}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p className="text-blue-600">${item.price.toFixed(2)} each</p>
                                    {item.stock < 5 && (
                                        <p className="text-red-500 text-sm">Only {item.stock} left in stock!</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 border-t border-gray-300 pt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-bold">Total:</span>
                            <span className="text-xl font-bold">${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                        </div>
                        <button
                            className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                            onClick={() => setIsOpen(true)}
                            disabled={cartItems.length === 0}
                        >
                            Proceed to Checkout
                        </button>

                        <Modal
                            isOpen={modalIsOpen}
                            onRequestClose={() => setIsOpen(false)}
                            style={customStyles}
                            ariaHideApp={false}
                        >
                            <div className="p-6 sm:p-8">
                                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-200">
                                    Shipping Details & Order
                                </h2>
                                <form onSubmit={handleSubmitOrder}>
                                    <div className="space-y-6">
                                        <div>
                                            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                            <input
                                                id="street"
                                                type="text"
                                                required
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3"
                                                value={address.street}
                                                onChange={(e) => setAddress(prev => ({ ...prev, street: e.target.value }))}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                <input
                                                    id="city"
                                                    type="text"
                                                    required
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3"
                                                    value={address.city}
                                                    onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                                <input
                                                    id="state"
                                                    type="text"
                                                    required
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3"
                                                    value={address.state}
                                                    onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                                            <input
                                                id="zipCode"
                                                type="text"
                                                required
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3"
                                                value={address.zipCode}
                                                onChange={(e) => setAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                                            />
                                        </div>
                                        <div className="border-t border-gray-200 mt-6 pt-6">
                                            <p className="text-lg font-semibold text-gray-800">
                                                Order Total: ${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="flex justify-end items-center gap-3 sm:gap-4 mt-8 pt-6 border-t border-gray-200">
                                            <button
                                                type="button"
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'Placing Order...' : 'Place Order'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </Modal>
                    </div>
                </>
            )}
        </div>
    );
}