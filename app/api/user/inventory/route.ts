import { NextResponse } from "next/server";
import db from "@/lib/firebase_db";
import { doc, getDoc, updateDoc } from "firebase/firestore";

interface InventoryItem {
    productId: string;
    quantity: number;
}

export async function POST(request: Request) {
    try {
        const { uid, items }: { uid: string, items: InventoryItem[] } = await request.json();

        if (!uid || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: "Missing or invalid fields: uid and items (array of products with quantities)" },
                { status: 400 }
            );
        }

        for (const item of items) {
            if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) {
                return NextResponse.json(
                    { error: "Invalid item format. Each item must have productId and positive quantity" },
                    { status: 400 }
                );
            }
        }

        const userRef = doc(db, "Users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const currentInventory = userSnap.data().inventory || {};
        
        items.forEach(item => {
            currentInventory[item.productId] = (currentInventory[item.productId] || 0) + item.quantity;
        });

        await updateDoc(userRef, {
            inventory: currentInventory,
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({
            message: `${items.length} items updated in inventory successfully`,
            inventory: currentInventory
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating inventory:", error);
        return NextResponse.json(
            { error: "Failed to update inventory" },
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
                { error: "Missing uid" },
                { status: 400 }
            );
        }

        const userRef = doc(db, "Users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const inventory = userSnap.data().inventory || {};

        return NextResponse.json({
            message: "Inventory retrieved successfully",
            inventory
        }, { status: 200 });

    } catch (error) {
        console.error("Error retrieving inventory:", error);
        return NextResponse.json(
            { error: "Failed to retrieve inventory" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');
        const productId = searchParams.get('productId');
        const { quantity } = await request.json();

        if (!uid || !productId || typeof quantity !== 'number' || quantity < 0) {
            return NextResponse.json(
                { error: "Missing or invalid parameters" },
                { status: 400 }
            );
        }

        const userRef = doc(db, "Users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const currentInventory = userSnap.data().inventory || {};

        if (quantity === 0) {
            delete currentInventory[productId];
        } else {
            currentInventory[productId] = quantity;
        }

        await updateDoc(userRef, {
            inventory: currentInventory,
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({
            message: "Inventory updated successfully",
            inventory: currentInventory
        });

    } catch (error) {
        console.error("Error updating inventory:", error);
        return NextResponse.json(
            { error: "Failed to update inventory" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');
        const productId = searchParams.get('productId');

        if (!uid || !productId) {
            return NextResponse.json(
                { error: "Missing parameters" },
                { status: 400 }
            );
        }

        const userRef = doc(db, "Users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const currentInventory = userSnap.data().inventory || {};
        
        if (!(productId in currentInventory)) {
            return NextResponse.json(
                { error: "Product not found in inventory" },
                { status: 404 }
            );
        }

        delete currentInventory[productId];

        await updateDoc(userRef, {
            inventory: currentInventory,
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({
            message: "Item removed from inventory successfully",
            inventory: currentInventory
        });

    } catch (error) {
        console.error("Error deleting from inventory:", error);
        return NextResponse.json(
            { error: "Failed to delete from inventory" },
            { status: 500 }
        );
    }
}