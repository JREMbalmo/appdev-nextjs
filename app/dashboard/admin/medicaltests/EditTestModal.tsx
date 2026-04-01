"use client";

import { useState, useRef, useEffect } from "react";
import { X, GripHorizontal } from "lucide-react";
import { Category, UOM, MedicalTest } from "./actions";

interface EditTestModalProps {
  isOpen: boolean; onClose: () => void;
  onEdit: (id: string, data: any) => Promise<void>;
  test: MedicalTest | null;
  categories: Category[]; uoms: UOM[];
}

export default function EditTestModal({ isOpen, onClose, onEdit, test, categories, uoms }: EditTestModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [idcategory, setIdcategory] = useState("");
  const [iduom, setIduom] = useState("");
  const [normalmin, setNormalmin] = useState("");
  const [normalmax, setNormalmax] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const currentTranslate = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen && test) {
      setName(test.name); setDescription(test.description || ""); setIdcategory(test.idcategory); setIduom(test.iduom);
      setNormalmin(test.normalmin !== null ? test.normalmin.toString() : ""); setNormalmax(test.normalmax !== null ? test.normalmax.toString() : "");
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, test]);

  // Drag logic identical to Add Modal
  const onMouseDown = (e: React.MouseEvent) => { isDragging.current = true; dragStart.current = { x: e.clientX, y: e.clientY }; document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp); };
  const onMouseMove = (e: MouseEvent) => { if (isDragging.current) setPosition({ x: currentTranslate.current.x + (e.clientX - dragStart.current.x), y: currentTranslate.current.y + (e.clientY - dragStart.current.y) }); };
  const onMouseUp = (e: MouseEvent) => { if (isDragging.current) { currentTranslate.current = { x: currentTranslate.current.x + (e.clientX - dragStart.current.x), y: currentTranslate.current.y + (e.clientY - dragStart.current.y) }; isDragging.current = false; document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    if(test) await onEdit(test.id, { name, description, idcategory, iduom, normalmin: parseFloat(normalmin), normalmax: parseFloat(normalmax) });
    setIsSubmitting(false); onClose();
  };

  if (!isOpen || !test) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div ref={modalRef} className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col" style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
        <div className="bg-amber-500 px-4 py-3 border-b flex items-center justify-between cursor-move select-none" onMouseDown={onMouseDown}>
          <div className="flex items-center gap-2 text-white font-semibold"><GripHorizontal size={20} className="text-white/70" /><span>Edit Medical Test</span></div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="text-sm">Test Name *</label><input type="text" required className="w-full border p-2 rounded" value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm">Category *</label><select required className="w-full border p-2 rounded" value={idcategory} onChange={e => setIdcategory(e.target.value)}><option value="">Select Category...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="text-sm">Unit (UOM) *</label><select required className="w-full border p-2 rounded" value={iduom} onChange={e => setIduom(e.target.value)}><option value="">Select Unit...</option>{uoms.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm">Normal Min</label><input type="number" step="any" className="w-full border p-2 rounded" value={normalmin} onChange={e => setNormalmin(e.target.value)} /></div>
            <div><label className="text-sm">Normal Max</label><input type="number" step="any" className="w-full border p-2 rounded" value={normalmax} onChange={e => setNormalmax(e.target.value)} /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-amber-500 rounded hover:bg-amber-600">Save Changes</button>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}