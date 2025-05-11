import db from "@/lib/firebase_db";
import { NextResponse } from "next/server";
import { collection, getDocs, addDoc } from "firebase/firestore";

export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, "Market"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching market data:", error);
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ['desc', 'img', 'price', 'rating', 'title', 'uid', 'nameseller', 'imgseller', 'category'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (typeof body.stock !== 'number' || body.stock < 0) {
      return NextResponse.json(
        { error: "Stock must be a non-negative number" },
        { status: 400 }
      );
    }

    const newProduct = {
      desc: String(body.desc),
      img: String(body.img),
      price: Number(body.price),
      rating: Number(body.rating),
      stock: Number(body.stock),
      title: String(body.title),
      uid: String(body.uid),
      nameseller: String(body.nameseller),
      imgseller: String(body.imgseller),
      category: String(body.category),
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "Market"), newProduct);

    return NextResponse.json({
      message: "Product created successfully",
      id: docRef.id,
      ...newProduct
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}