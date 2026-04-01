"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { showMessage } from '@/components/MessageModal';
import { getMedicalTests, addMedicalTest, updateMedicalTest, deleteMedicalTest, getCategories, getUOMs, MedicalTest, Category, UOM } from "./actions";
import { downloadTestsExcel } from "./DownloadTests";
import DownloadTestsPdf from "./DownloadTestsPdf";
import AddTestModal from "./AddTestModal";
import EditTestModal from "./EditTestModal";
import DeleteTestModal from "./DeleteTestModal";
import PageGuardWrapper from "@/components/PageGuardWrapper";
import ButtonGuardWrapper from "@/components/ButtonGuardWrapper";
import ConfirmModal from "@/components/ConfirmModal";

export default function MedicalTestsPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    
    const [tests, setTests] = useState<MedicalTest[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [uoms, setUOMs] = useState<UOM[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [testToEdit, setTestToEdit] = useState<MedicalTest | null>(null);
    const [testToDelete, setTestToDelete] = useState<MedicalTest | null>(null);

    useEffect(() => {
        if (!isPending && !session) router.push("/");
    }, [session, isPending, router]);

    const fetchData = useCallback(async () => {
        try {
            const [fetchedTests, fetchedCategories, fetchedUOMs] = await Promise.all([
                getMedicalTests(), getCategories(), getUOMs()
            ]);
            setTests(fetchedTests);
            setCategories(fetchedCategories);
            setUOMs(fetchedUOMs);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (session) fetchData();
    }, [session, fetchData]);

    const handleAdd = async (data: Omit<MedicalTest, "id" | "category" | "unit">) => {
        try {
            await addMedicalTest(data);
            await showMessage("Medical Test added successfully!");
            fetchData();
        } catch (error) {
            console.error(error);
            await showMessage("Failed to add test.");
        }
    };

    const handleEdit = async (id: string, data: Omit<MedicalTest, "id" | "category" | "unit">) => {
        try {
            await updateMedicalTest(id, data);
            await showMessage("Medical Test updated successfully!");
            fetchData();
        } catch (error) {
            console.error(error);
            await showMessage("Failed to update test.");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteMedicalTest(id);
            await showMessage("Medical Test deleted successfully!");
            fetchData();
        } catch (error) {
            console.error(error);
            await showMessage("Failed to delete test.");
        }
    };

    const handleDownloadExcel = async () => {
        const confirmed = await ConfirmModal("Download Tests to Excel?", { okText: "Yes, Download" });
        if (!confirmed) return;
        downloadTestsExcel(filteredTests);
    };

    if (isPending || !session) return <div className="p-6">Loading...</div>;

    const filteredTests = tests.filter(test => 
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        test.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <PageGuardWrapper requiredRoles={["ADMINISTRATOR"]}>
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-x-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Medical Tests</h1>

        <div className="relative flex-1 max-w-md">
          <input type="text" placeholder="Search tests..." className="w-full rounded-md border px-4 py-2 text-sm outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold" onClick={() => setSearchQuery("")}>Clear</button>
        </div>

        <div className="flex gap-2">
            <button onClick={handleDownloadExcel} className="rounded-md bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 shadow-sm whitespace-nowrap">
                Download Excel
            </button>
            <DownloadTestsPdf tests={filteredTests} searchQuery={searchQuery} />
        </div>

        <button onClick={() => setIsAddModalOpen(true)} className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm whitespace-nowrap">
          + Add Test
        </button>
      </div>

      <AddTestModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAdd} categories={categories} uoms={uoms} />
      <EditTestModal isOpen={!!testToEdit} onClose={() => setTestToEdit(null)} onEdit={handleEdit} test={testToEdit} categories={categories} uoms={uoms} />
      <DeleteTestModal isOpen={!!testToDelete} onClose={() => setTestToDelete(null)} onDelete={handleDelete} test={testToDelete} />

      <div className="max-h-[calc(100vh-260px)] overflow-auto rounded border bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Row #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Test Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Unit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Min - Max</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600 print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTests.map((test, index) => (
                <tr key={test.id} className="even:bg-gray-50/80 hover:bg-blue-50/50">
                  <td className="px-4 py-2 text-sm">{index + 1}</td>
                  <td className="px-4 py-2 text-sm font-medium">{test.name}</td>
                  <td className="px-4 py-2 text-sm">{test.category}</td>
                  <td className="px-4 py-2 text-sm">{test.unit}</td>
                  <td className="px-4 py-2 text-sm">{test.normalmin} - {test.normalmax}</td>
                  <td className="px-6 py-2 text-sm space-x-2 print:hidden">
                      <button onClick={() => setTestToEdit(test)} className="rounded bg-amber-500 px-3 py-1 text-white hover:bg-amber-600">Edit</button>
                      <button onClick={() => setTestToDelete(test)} className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600">Delete</button>
                  </td>
                </tr>
              ))}
              {!loading && filteredTests.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-4 text-center text-gray-500">No medical tests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-sm text-gray-700">Showing {filteredTests.length} of {tests.length} tests</div>
    </div>
    </PageGuardWrapper>
  );
}