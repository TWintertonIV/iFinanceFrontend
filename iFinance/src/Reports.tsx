import { useState } from 'react' // Import useState
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./components/ui/card";
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"; // Assuming you have a Dialog component
import { Download, X } from "lucide-react"; // Icons for buttons

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useToken } from './components/Login/useToken';

function Reports() {
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);
	const [pdfFilename, setPdfFilename] = useState<string>("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { token } = useToken(); // Assuming token is stored in localStorage

	const handleReportClick = async (url: string, filename: string) => {
		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/pdf",
					"Authorization": `${token.token}`,
				} // Assuming token is stored in localStorage
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const blob = await response.blob();
			const fileURL = URL.createObjectURL(blob);
			setPdfUrl(fileURL);
			setPdfFilename(filename);
			setIsModalOpen(true);
		} catch (error) {
			console.error("Error fetching report:", error);
			alert("Failed to load report.");
		}
	};

	const handleDownload = () => {
		if (!pdfUrl) return;
		const link = document.createElement('a');
		link.href = pdfUrl;
		link.download = pdfFilename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const closeModal = () => {
		if (pdfUrl) {
			URL.revokeObjectURL(pdfUrl); // Clean up the object URL
		}
		setIsModalOpen(false);
		setPdfUrl(null);
		setPdfFilename("");
	};


	return (
	<>
<SidebarProvider className="dark">
<AppSidebar />
<SidebarInset>
<div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gradient-to-br from-gray-900 to-blue-900 p-4">
<SidebarTrigger className="-ml-1 text-white" />
	<Card className="w-full bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
	<CardHeader><CardTitle className="text-3xl font-bold text-white text-center"> iFinance Reports </CardTitle></CardHeader>
	<CardContent>
		<div className="flex flex-wrap justify-center gap-4">
			<Button
				onClick={() => handleReportClick("https://ifinance-p4vg.onrender.com/api/document/trial_balance/", "trial_balance.pdf")}
				className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 rounded"
			>
				Trial Balance
			</Button>
			<Button
				onClick={() => handleReportClick("https://ifinance-p4vg.onrender.com/api/document/balance_sheet/", "balance_sheet.pdf")}
				className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 rounded"
			>
				Balance Sheet
			</Button>
			{/* <Button
				onClick={() => handleReportClick("https://ifinance-p4vg.onrender.com/api/document/profit_loss/", "profit_loss.pdf")} // Assuming profit loss URL
				className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 rounded"
			>
				Profit & Loss
			</Button>
			<Button
				onClick={() => handleReportClick("https://ifinance-p4vg.onrender.com/api/document/cash_flow/", "cash_flow.pdf")}
				className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-6 rounded"
			>
				Cash Flow
			</Button> */}
		</div>
	</CardContent>
	<CardDescription className="text-center text-gray-400 mt-4">
		Click a button to generate and view the corresponding report as a PDF.
	</CardDescription>

	</Card>

	{/* PDF Preview Modal */}
	<Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
		<DialogContent className="w-[1800px] max-w-[1800px] h-[98vh] flex flex-col bg-gray-800 text-white border-gray-700">
			<DialogHeader className="flex-shrink-0">
				<DialogTitle>{pdfFilename || "Report Preview"}</DialogTitle>
				<DialogClose asChild className = "hidden">
					<Button variant="ghost" size="icon" className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={closeModal}>
						<X className="h-4 w-4" />
					</Button>
				</DialogClose>
			</DialogHeader>
			<div className="flex-grow overflow-hidden">
				{pdfUrl ? (
					<iframe src={pdfUrl} width="100%" height="100%" title={pdfFilename} className="border-0" />
				) : (
					<p className="text-center p-4">Loading PDF...</p>
				)}
			</div>
			<DialogFooter className="flex-shrink-0 p-4 border-t border-gray-700">
				<Button onClick={handleDownload} disabled={!pdfUrl} className="bg-green-600 hover:bg-green-700">
					<Download className="mr-2 h-4 w-4" /> Download
				</Button>
				<Button onClick={closeModal} className="border-gray-600 hover:bg-gray-700">
					Close
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</div>
</SidebarInset>
</SidebarProvider>
</>
);
}

export default Reports;
