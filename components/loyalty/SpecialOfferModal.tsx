import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { SpecialOffer, CreateSpecialOfferInput } from "@/types/specialOffer";
import { supabase } from "@/lib/supabase";
import { ImageUpload } from "@/components/services/ImageUpload";

interface SpecialOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer?: SpecialOffer | null;
  onSave: (offer: CreateSpecialOfferInput & { id?: string }) => Promise<void>;
}

export const SpecialOfferModal: React.FC<SpecialOfferModalProps> = ({
  isOpen,
  onClose,
  offer,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (offer) {
        setTitle(offer.title);
        setDescription(offer.description || "");
        setImageUrl(offer.image_url || "");
        setIsActive(offer.is_active);
      } else {
        setTitle("");
        setDescription("");
        setImageUrl("");
        setIsActive(true);
      }
      setImageFile(null);
    }
  }, [isOpen, offer]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = imageUrl;

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `special-offer-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `special-offers/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);

        finalImageUrl = urlData.publicUrl;
      }

      await onSave({
        id: offer?.id,
        title: title.trim(),
        description: description.trim(),
        image_url: finalImageUrl,
        is_active: isActive,
      });

      onClose();
    } catch (err: any) {
      console.error("Error saving special offer:", err);
      alert(err.message || "Failed to save special offer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-[#2A2A2A] p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    {offer ? "Edit Special Offer" : "New Special Offer"}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Image
                    </label>
                    <div className="flex justify-center">
                      <ImageUpload
                        imageUrl={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                        onImageChange={setImageFile}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#191919] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#C1A7A3] focus:outline-none focus:ring-1 focus:ring-[#C1A7A3]"
                      placeholder="Enter title"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#191919] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#C1A7A3] focus:outline-none focus:ring-1 focus:ring-[#C1A7A3]"
                      placeholder="Enter description"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#C1A7A3] focus:ring-[#C1A7A3]"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-900 dark:text-white"
                    >
                      Active
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex justify-center rounded-lg border border-transparent bg-[#C1A7A3] px-4 py-2 text-sm font-medium text-white hover:bg-[#A8928E] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
