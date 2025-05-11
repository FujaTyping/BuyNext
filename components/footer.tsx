import React from 'react'
import Logo from "@/assets/BlueLogo.svg"

function Footer() {
    return (
        <>
            <main className='bg-gray-100 text-black'>
                <footer className='max-w-7xl mx-auto flex justify-between flex-col gap-5 md:flex-row items-center md:items-start border-b border-b-gray-300 py-6'>
                    <div className='flex flex-col gap-2 items-center md:items-start'>
                        <div className='flex items-center gap-1'>
                            <img src={Logo.src} alt="Logo" className='w-10 h-10' />
                            <p className='font-bold text-xl text-blue-500'>BuyNext</p>
                        </div>
                        <p className='text-center md:text-start max-w-xs md:max-w-3xl'>Your go-to place for quality products and smooth experience.</p>
                    </div>
                    <div className='flex flex-col md:flex-row items-center mx-auto md:mx-0 text-center md:text-start gap-10 md:gap-25'>
                        <div className='flex flex-col gap-3'>
                            <p className='font-bold mb-1'>Shop</p>
                            <a className='hover:text-gray-500' href="#">All Products</a>
                            <a className='hover:text-gray-500' href="#">Categories</a>
                            <a className='hover:text-gray-500' href="#">Best Sellers</a>
                            <a className='hover:text-gray-500' href="#">New Arrrivals</a>
                        </div>
                        <div className='flex flex-col gap-3'>
                            <p className='font-bold mb-1'>Support</p>
                            <a className='hover:text-gray-500' href="#">FAQs</a>
                            <a className='hover:text-gray-500' href="#">Contact Us</a>
                            <a className='hover:text-gray-500' href="#">Shipping Info</a>
                            <a className='hover:text-gray-500' href="#">Returns</a>
                        </div>
                        <div className='flex flex-col gap-3'>
                            <p className='font-bold mb-1'>Legal & Policies</p>
                            <a className='hover:text-gray-500' href="#">Terms of Service</a>
                            <a className='hover:text-gray-500' href="#">Privacy Policy</a>
                            <a className='hover:text-gray-500' href="#">Cookie Policy</a>
                            <a className='hover:text-gray-500' href="#">Disclaimer</a>
                        </div>
                    </div>

                </footer>
                <footer className='max-w-7xl mx-auto flex items-center justify-center py-4'>
                    <p>© 2025 BuyNext. All Rights Reserved.</p>
                </footer>
            </main>
        </>
    )
}

export default Footer