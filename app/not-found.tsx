import React from 'react';
import Link from 'next/link';
import FF from "@/assets/FOF.svg";
import { IoMdArrowRoundBack } from 'react-icons/io';

export default function NotFound() {
  return (
    <div className='flex items-center justify-center flex-col gap-4 py-18'>
      <img src={FF.src} className='max-w-[300px]' alt="Notfound" />
      <div className='flex flex-col items-center justify-center'>
        <p className='font-bold text-2xl text-center'>Oops! Page Not Found</p>
        <p className='text-center mt-2'>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        <Link href="/" className="flex items-center gap-2 mt-6 w-fit px-5 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300">
          <IoMdArrowRoundBack />
          <p>Go to Homepage</p>
        </Link>
      </div>
    </div>
  );
}