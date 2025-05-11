'use client'
import React from 'react' // Added useState
import Link from 'next/link';
import Image from 'next/image';
import { shadow } from '@/styles/utils'; // Assuming this is correctly defined
import DarkModeToggle from './DarkModeToggle'; // Assuming this component exists
import GeminiSheet from '@/components/GeminiSheet'


function Header() {


    return (
        <header
            className='absolute flex h-24 w-full items-center justify-between bg-popover px-2 z-10 sm:min-w-[400px]' // z-10 to be above other content
            style={{
                boxShadow: shadow, // Make sure 'shadow' is a valid CSS box-shadow string
            }}>
            <Link href="/" className="flex items-end gap-2">
                <Image src="/Slogo.jpg" alt='Scrypt Notes Logo' height={60} width={60} className="rounded-full" priority />
                <h1 className='flex flex-col pb-1 text-2xl font-semibold leading-6'> {/* Corrected font-semibold */}
                    Scrypt <span>Notes</span>
                </h1>
            </Link>

            <div className="flex items-center gap-4"> 
                <GeminiSheet />
                <DarkModeToggle />
            </div>
        </header>
    )
}

export default Header;