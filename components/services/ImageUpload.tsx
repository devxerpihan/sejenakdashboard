"use client";

import React, { useRef, useState, useEffect } from "react";
import { UploadIcon } from "@/components/icons";

interface ImageUploadProps {
  imageUrl?: string;
  onImageChange: (file: File | null) => void;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  imageUrl,
  onImageChange,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(imageUrl || null);

  // Update preview when imageUrl prop changes
  useEffect(() => {
    if (imageUrl) {
      setPreview(imageUrl);
    }
  }, [imageUrl]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      onImageChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className={className}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors
          ${isDragging 
            ? "border-[#C1A7A3] bg-[#F0EEED] dark:bg-[#3D3B3A]" 
            : "border-zinc-300 dark:border-zinc-700 hover:border-[#C1A7A3]"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {preview ? (
          <div className="relative flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg min-h-[200px]">
            <img
              src={preview}
              alt="Treatment preview"
              className="max-w-full max-h-64 object-contain rounded-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                onImageChange(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <UploadIcon />
            <p className="mt-2 text-sm text-[#706C6B] dark:text-[#C1A7A3]">
              Click to upload image or drag and drop
            </p>
            <p className="mt-1 text-xs text-[#706C6B] dark:text-[#C1A7A3]">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

