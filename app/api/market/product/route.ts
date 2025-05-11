import { NextResponse } from "next/server";
import db from "@/lib/firebase_db";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('id');

        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        const productRef = doc(db, "Market", productId);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        const productData = {
            id: productSnap.id,
            ...productSnap.data()
        };

        return NextResponse.json(productData);

    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json(
            { error: "Failed to fetch product details" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('id');
        const { quantity } = await request.json();

        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        if (typeof quantity !== 'number' || quantity < 0) {
            return NextResponse.json(
                { error: "Valid quantity is required" },
                { status: 400 }
            );
        }

        const productRef = doc(db, "Market", productId);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        const currentStock = productSnap.data().stock;
        const newStock = currentStock - quantity;

        if (newStock < 0) {
            return NextResponse.json(
                { error: "Insufficient stock" },
                { status: 400 }
            );
        }

        await updateDoc(productRef, {
            stock: newStock,
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({
            message: "Stock updated successfully",
            newStock
        });

    } catch (error) {
        console.error("Error updating stock:", error);
        return NextResponse.json(
            { error: "Failed to update stock" },
            { status: 500 }
        );
    }
}