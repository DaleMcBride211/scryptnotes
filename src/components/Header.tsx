'use client'
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { shadow } from '@/styles/utils';
import { Button } from '@/components/ui/button';
import DarkModeToggle from './DarkModeToggle';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import RichTextEditor from './RichTextEditor';






function Header() {
  return (
    <header 
    className='relative flex h-24 w-full items-center justify-between bg-popover px-3 sm:px-8 min-w-[400px]' 
    style={{
        boxShadow: shadow,

    }}>
        <Link href="/" className="flex items-end gap-2">
        <Image src="/Slogo.jpg" alt='' height={60} width={60} className="rounded-full" priority></Image>
        <h1 className='flex flex-col pb-1 text-2xl fond-semibold leading-6'>
            Scrypt <span>Notes</span>
        </h1>
        </Link>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="text-xl">+</Button>
          </DialogTrigger>
          <DialogContent className="[&>button]:hidden">
            <DialogHeader>
              <DialogTitle><Input type='title' placeholder='Title'/></DialogTitle>
              <div className='max-w-3xl'>
                <RichTextEditor />
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <div className="flex gap-4">
          <DarkModeToggle />
        </div>
    </header>
  )
}

export default Header