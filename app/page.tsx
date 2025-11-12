"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F0EEED] dark:bg-[#191919] flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        {/* Logo */}
        <div className="mb-12">
          <img 
            src="/images/Logo Baru Sejenak-03.png" 
            alt="Sejenak Beauty Lounge" 
            className="h-32 w-auto mx-auto mb-8"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl font-bold text-[#191919] dark:text-[#F0EEED] mb-6">
          Sejenak Beauty Lounge
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-[#706C6B] dark:text-[#C1A7A3] mb-12">
          Your Beauty, Our Passion
        </p>

        {/* CTA Button */}
        <Link
          href="/dashboard"
          className="inline-block px-8 py-4 bg-[#C1A7A3] hover:bg-[#A88F8B] text-white rounded-lg text-lg font-medium transition-colors shadow-lg"
        >
          Enter Dashboard
        </Link>

        {/* Footer Text */}
        <p className="mt-16 text-sm text-[#706C6B] dark:text-[#C1A7A3]">
          © 2025 Sejenak Beauty Lounge, All Rights Reserved
        </p>
      </div>
    </div>
  );
}
