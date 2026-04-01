"use client";

import React, { useState } from 'react';
import { MedicalTest } from "./actions";
import TestsPdfDocument from './TestsPdfDocument';
import { pdf } from '@react-pdf/renderer';
import ConfirmModal from "@/components/ConfirmModal";

interface DownloadTestsPdfProps {
    tests: MedicalTest[];
    searchQuery: string;
}

const DownloadTestsPdf: React.FC<DownloadTestsPdfProps> = ({ tests, searchQuery }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        const confirmed = await ConfirmModal("Download Tests to PDF (A4)?", { okColor: "bg-purple-600" });
        if (!confirmed) return;
        setIsGenerating(true);
        try {
            const blob = await pdf(<TestsPdfDocument tests={tests} totalCount={tests.length} searchQuery={searchQuery} />).toBlob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "MedicalTests.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button onClick={handleDownload} disabled={isGenerating} className="rounded-md bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 shadow-sm whitespace-nowrap">
            {isGenerating ? "Preparing PDF..." : "Download PDF"}
        </button>
    );
};

export default DownloadTestsPdf;