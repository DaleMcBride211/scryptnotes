'use client'
import React, { useState } from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { shadow } from '@/styles/utils';
import DarkModeToggle from './DarkModeToggle';



function Header() {

  
  return (
    <header 
    className='absolute flex h-24 w-full items-center justify-between bg-popover px-2 z-1 sm:min-w-[400px]' 
    style={{
        boxShadow: shadow,
    }}>
        <Link href="/" className="flex items-end gap-2">
        <Image src="/Slogo.jpg" alt='' height={60} width={60} className="rounded-full" priority></Image>
        <h1 className='flex flex-col pb-1 text-2xl fond-semibold leading-6'>
            Scrypt <span>Notes</span>
        </h1>
        </Link>

        <div className="flex gap-4">
          <DarkModeToggle />
        </div>
    </header>
  )
}

export default Header