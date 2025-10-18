'use client'
import React from 'react' 
import Link from 'next/link';
import Image from 'next/image';
import { shadow } from '@/styles/utils'; 
import DarkModeToggle from './DarkModeToggle'; 
import GeminiSheet from '@/components/GeminiSheet'


function Header() {


    return (
        <header
            className='absolute flex h-24 w-full items-center justify-between bg-popover px-2 z-10 sm:min-w-[400px]'
            style={{
                boxShadow: shadow, 
            }}>
            <Link href="/" className="flex items-end gap-2">
                <Image src="/scryptlogo.png" alt='Scrypt Notes Logo' height={60} width={60} className="rounded-full" priority />
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