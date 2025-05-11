import { NextResponse } from "next/server";
import db from "@/lib/firebase_db";
import { collection, getDocs } from "firebase/firestore";

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

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryQuery = searchParams.get('category');

        if (!categoryQuery) {
            return NextResponse.json(
                { error: "Category parameter is required" },
                { status: 400 }
            );
        }

        const querySnapshot = await getDocs(collection(db, "Market"));
        
        const filteredData = querySnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            } as MarketItem))
            .filter(item => 
                item.category.toLowerCase().includes(categoryQuery.toLowerCase())
            );

        return NextResponse.json(filteredData);

    } catch (error) {
        console.error("Error fetching category products:", error);
        return NextResponse.json(
            { error: "Failed to fetch category products" },
            { status: 500 }
        );
    }
}