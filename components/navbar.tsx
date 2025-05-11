"use client";
import React, { useState, useEffect } from 'react'
import { FaGoogle, FaShoppingBag, FaYoutube } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import Logo from "@/assets/Logo.svg"
import { FaXTwitter } from "react-icons/fa6";
import { CiInstagram } from "react-icons/ci";
import Link from 'next/link';
import { MdOutlineLiveHelp } from 'react-icons/md';

import { GoogleAuthProvider, signInWithPopup, signOut, getAuth, User } from 'firebase/auth';
import auth from "../lib/firebase_auth";
import { useRouter } from 'next/navigation';

import axios from 'axios';

function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const createUserInFirestore = async (user: User) => {
        try {
            await axios.post('/api/user', {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            });
        } catch (error) {
            console.error("Error creating user in Firestore:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = getAuth().onAuthStateChanged((user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            await createUserInFirestore(result.user);
        } catch (error) {
            console.error("Error signing in with Google:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleSearch = () => {
        if (searchTerm.trim() !== '') {
            router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    return (
        <>
            <main className='bg-gradient-to-b from-blue-500 via-blue-500 to-blue-400 text-white'>
                {/* Top bar */}
                <nav className='py-2 flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-sm'>
                    <div className='flex items-center gap-2 sm:gap-3'>
                        <p className='mr-2 hidden sm:inline'>Follow us on</p>
                        <a href="#" className='hover:text-red-500'><FaYoutube /></a>
                        <a href="#" className='hover:text-black'><FaXTwitter /></a>
                        <a href="#" className='hover:text-pink-400'><CiInstagram /></a>
                    </div>
                    <div className='flex items-center gap-3 sm:gap-4'>
                        <Link href={"/help"} className='flex items-center gap-1 sm:gap-2 hover:underline'><MdOutlineLiveHelp /><p>Help</p></Link>
                        {user ? (
                            <div className='flex items-center gap-2'>
                                <Link href={"/user"} className='cursor-pointer'><span>{user.displayName}</span></Link>
                                <button
                                    onClick={handleLogout}
                                    className='text-sm px-2 py-1 rounded underline cursor-pointer'
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleGoogleLogin}
                                className='flex items-center gap-2 cursor-pointer'
                            >
                                <FaGoogle /> Login with Google
                            </button>
                        )}
                    </div>
                </nav>
                {/* Main navigation */}
                <nav className='max-w-7xl py-4 sm:py-5 mx-auto flex flex-wrap justify-between items-center gap-x-4 sm:gap-x-6 gap-y-3 px-4 sm:px-6 lg:px-8'>
                    {/* Logo and Brand Name */}
                    <Link href={"/"} className="flex items-center gap-2 order-1">
                        <img src={Logo.src} alt="Logo" className='w-8 h-8 sm:w-9 sm:h-9' />
                        <p className='font-bold text-lg sm:text-xl'>BuyNext</p>
                    </Link>

                    {/* Search Bar - Takes full width on small screens, flexible on larger */}
                    <div className='w-full md:flex-1 md:max-w-md lg:max-w-xl order-3 md:order-2 flex gap-2 items-center p-1 pl-3 sm:pl-4 rounded-lg bg-white border text-gray-700'>
                        <input
                            className='w-full focus:outline-none text-black bg-transparent placeholder-gray-500 text-sm sm:text-base'
                            type="text"
                            placeholder='Search products here'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                        />
                        <button onClick={handleSearch} className='text-white bg-blue-500 p-2 rounded-md cursor-pointer active:bg-blue-600 hover:bg-blue-600 transition-colors'>
                            <IoSearchOutline className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>

                    {/* Cart Icon */}
                    <Link href={"/cart"} className="order-2 md:order-3">
                        {/* The div helps with alignment if you ever add text or a badge next to the icon */}
                        <FaShoppingBag className='cursor-pointer hover:text-gray-200 w-6 h-6 sm:w-7 sm:h-7' />
                    </Link>
                </nav>
            </main>
        </>
    )
}
export default Navbar