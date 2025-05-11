"use client";

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

interface Order {
    id: string;
    status: string;
    createdAt: string;
    totalAmount: number;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const response = await axios.get(`/api/order?uid=${user.uid}`);
                    setOrders(response.data.orders as Order[]);
                } catch (err) {
                    console.error('Error fetching orders:', err);
                    setError('Failed to load orders');
                } finally {
                    setLoading(false);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <>
        <div className="flex justify-center items-center py-52">
            <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-l-3 border-blue-500"></div>
        </div>
    </>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="max-w-7xl mx-auto p-4 py-12">
            <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="border border-gray-300 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">Order ID: {order.id}</span>
                            <span className="capitalize bg-blue-100 px-2 py-1 rounded text-sm">
                                {order.status}
                            </span>
                        </div>
                        <div className="text-sm text-gray-600">
                            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                            <p>Total Amount: ${order.totalAmount.toFixed(2)}</p>
                        </div>
                    </div>
                ))}
                {orders.length === 0 && (
                    <p className="text-center text-gray-500">No orders found</p>
                )}
            </div>
        </div>
    );
}