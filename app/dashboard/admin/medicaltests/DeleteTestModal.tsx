"use client";

import { useState, useRef, useEffect } from "react";
import { X, GripHorizontal } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { MedicalTest } from "./actions";

interface DeleteTestModalProps {
  isOpen: boolean; onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  test: MedicalTest | null;
}

export default function DeleteTestModal({ isOpen, onClose, onDelete, test }: DeleteTestModalProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (isOpen) setPosition({ x: 0, y: 0 }); }, [isOpen]);

  const handleDelete = async () => {
    if (!test) return;
    const confirmed = await ConfirmModal(`Delete test "${test.name}"?`, { okColor: "bg-red-600 hover:bg-red-700" });
    if (!confirmed) return;
    await onDelete(test.id);
    onClose();
  };

  if (!isOpen || !test) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div ref={modalRef} className="w-full max-w-md bg-white rounded-xl shadow-2xl flex flex-col" style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
        <div className="bg-red-500 px-4 py-3 flex justify-between cursor-move select-none"><span className="text-white font-bold">Delete Test</span><button onClick={onClose} className="text-white"><X size={20}/></button></div>
        <div className="p-6 space-y-4 text-center">
            <p>Are you sure you want to delete <strong>{test.name}</strong>?</p>
            <div className="flex justify-end gap-3 pt-4">
                <button onClick={handleDelete} className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700">Delete</button>
                <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
            </div>
        </div>
      </div>
    </div>
  );
}