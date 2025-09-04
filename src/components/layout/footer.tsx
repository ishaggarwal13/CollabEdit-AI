
'use client';

import { AreaChart } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="sticky bottom-0 z-30 border-t bg-background/80 px-4 py-6 backdrop-blur-sm md:px-6">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Link href="#" className="flex items-center gap-2 font-semibold" prefetch={false}>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <AreaChart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg">FinDash</span>
        </Link>
        <p className="text-sm text-muted-foreground">© 2025 FinDash. All rights reserved.</p>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="#" className="text-sm hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-sm hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
