import { NextResponse } from "next/server";
import db from "@/lib/firebase_db";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

interface OrderItem {
    [productId: string]: number;
}

interface OrderData {
    uid: string;
    items: OrderItem;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered';
    createdAt: string;
}

export async function POST(request: Request) {
    try {
        const body: OrderData = await request.json();

        if (!body.uid || !body.items || !body.address) {
            return NextResponse.json(
                { error: "Missing required fields: uid, items, or address" },
                { status: 400 }
            );
        }

        if (Object.keys(body.items).length === 0) {
            return NextResponse.json(
                { error: "Order must contain at least one item" },
                { status: 400 }
            );
        }

        const newOrder = {
            uid: body.uid,
            items: body.items,
            address: body.address,
            totalAmount: body.totalAmount,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, "Orders"), newOrder);

        return NextResponse.json({
            message: "Order created successfully",
            orderId: docRef.id,
            ...newOrder
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');

        if (!uid) {
            return NextResponse.json(
                { error: "Missing uid parameter" },
                { status: 400 }
            );
        }

        const ordersRef = collection(db, "Orders");
        const q = query(ordersRef, where("uid", "==", uid));
        const querySnapshot = await getDocs(q);

        const orders = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({
            orders
        });

    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}