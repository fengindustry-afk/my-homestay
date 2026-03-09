'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function BannerPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show popup only on main page
    if (pathname === '/') {
      setIsOpen(true);
    }
  }, [pathname]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="rounded-lg max-w-lg w-67 mx-4 relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white shadow-lg transition-colors z-10"
        >
          <X size={16} />
        </button>
        <div className="relative w-full h-95">
          <Image
            src="/Ramadhan-Discount.png"
            alt="Banner"
            fill
            className="object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
