import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  Upload,
  Download,
  Eye,
  Trash2,
  Calendar,
  MapPin,
  X,
  FileText,
  Search,
  Sparkles,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

export interface DocumentVaultItem {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  category: 'Identification' | 'Insurance' | 'Property' | 'Medical' | 'Vehicle' | 'Warranties';
  docNumber?: string;
  expirationDate?: string;
  location: string;
  notes?: string;
  uploadedAt: string;
  fileDataUrl?: string;
}

const STORAGE_KEY = 'lifebinder_documents_v2';

const samplePdfDataUrl =
  'data:text/plain;charset=utf-8,LIFEBINDER%20SECURE%20DOCUMENT%20VAULT%0A%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%0AOfficial%20household%20record%20archived%20in%20your%20digital%20command%20vault.%0AAll%20rights%20reserved.';

const initialDocumentsData: DocumentVaultItem[] = [
  {
    id: 'doc-1',
    title: 'Home Deed & Title Insurance Policy',
    fileName: 'Home_Deed_and_Title_Insurance.pdf',
    fileSize: '2.4 MB',
    fileType: 'application/pdf',
    category: 'Property',
    docNumber: 'TIT-88219-WI',
    expirationDate: '2050-01-01',
    location: 'Fireproof Safe - Drawer 1',
    notes: 'Original recorded deed with Waukesha County Register of Deeds.',
    uploadedAt: 'Oct 14, 2026',
    fileDataUrl: samplePdfDataUrl,
  },
  {
    id: 'doc-2',
    title: 'Travelers Home & Auto Comprehensive Policy',
    fileName: 'Travelers_Home_Auto_Policy_2026.pdf',
    fileSize: '1.8 MB',
    fileType: 'application/pdf',
    category: 'Insurance',
    docNumber: 'TRV-992481-B',
    expirationDate: '2027-05-18',
    location: 'Digital Vault & Drawer 2',
    notes: '$1M umbrella liability, $500 deductible, auto full glass waiver.',
    uploadedAt: 'Nov 2, 2026',
    fileDataUrl: samplePdfDataUrl,
  },
  {
    id: 'doc-3',
    title: 'US Passports & Global Entry Cards',
    fileName: 'Passports_and_Global_Entry_Cards.pdf',
    fileSize: '3.1 MB',
    fileType: 'application/pdf',
    category: 'Identification',
    docNumber: 'GE-9844201',
    expirationDate: '2029-08-22',
    location: 'Master Bedroom Hidden Safe',
    notes: 'TSA PreCheck known traveler numbers and valid biometric passport copies.',
    uploadedAt: 'Sep 19, 2026',
    fileDataUrl: samplePdfDataUrl,
  },
  {
    id: 'doc-4',
    title: 'Carrier HVAC 10-Year Parts & Labor Warranty',
    fileName: 'HVAC_Carrier_10Year_Warranty.pdf',
    fileSize: '950 KB',
    fileType: 'application/pdf',
    category: 'Warranties',
    docNumber: 'CAR-552190',
    expirationDate: '2034-09-12',
    location: 'Basement Mechanical Room Folder',
    notes: 'Covers high-efficiency heat pump, evaporator coil, and smart thermostat.',
    uploadedAt: 'Sep 25, 2026',
    fileDataUrl: samplePdfDataUrl,
  },
  {
    id: 'doc-5',
    title: 'Pet Health, Vaccination & Microchip Registry',
    fileName: 'Pet_Vaccination_Microchip_Cert.pdf',
    fileSize: '1.2 MB',
    fileType: 'application/pdf',
    category: 'Medical',
    docNumber: 'CHIP-982109841',
    expirationDate: '2027-04-10',
    location: 'Kitchen Binder Pocket #2',
    notes: 'Rabies, DHPP, Bordetella, and 24Petwatch universal microchip number.',
    uploadedAt: 'Aug 10, 2026',
    fileDataUrl: samplePdfDataUrl,
  },
];

export const DocumentHubPage: React.FC = () => {
  const { celebrate } = useBinder();

  const [documents, setDocuments] = useState<DocumentVaultItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialDocumentsData;
    } catch {
      return initialDocumentsData;
    }
  });

  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentVaultItem | null>(null);

  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentVaultItem['category']>('Identification');
  const [docRecordNum, setDocRecordNum] = useState('');
  const [docExpDate, setDocExpDate] = useState('');
  const [docLocation, setDocLocation] = useState('Fireproof Safe - Drawer 1');
  const [docNotes, setDocNotes] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('');
  const [uploadedFileDataUrl, setUploadedFileDataUrl] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }, [documents]);

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setUploadedFileSize(file.size > 1024 * 1024 ? `${sizeInMb} MB` : `${Math.round(file.size / 1024)} KB`);
    if (!docTitle.trim()) {
      setDocTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setUploadedFileDataUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    const newDoc: DocumentVaultItem = {
      id: `doc-${Date.now()}`,
      title: docTitle.trim(),
      fileName: uploadedFileName || `${docTitle.trim().replace(/\s+/g, '_')}.pdf`,
      fileSize: uploadedFileSize || '1.5 MB',
      fileType: 'application/pdf',
      category: docCategory,
      docNumber: docRecordNum.trim() || undefined,
      expirationDate: docExpDate || undefined,
      location: docLocation.trim() || 'Physical Safe Drawer 1',
      notes: docNotes.trim() || undefined,
      uploadedAt: 'Today',
      fileDataUrl: uploadedFileDataUrl || samplePdfDataUrl,
    };

    setDocuments([newDoc, ...documents]);
    celebrate();
    setIsUploadModalOpen(false);
    setDocTitle('');
    setDocRecordNum('');
    setDocExpDate('');
    setDocNotes('');
    setUploadedFileName('');
    setUploadedFileDataUrl('');
    showToast(`Archived "${newDoc.title}" to Document Vault!`);
  };

  const handleDownloadFile = (doc: DocumentVaultItem) => {
    const link = document.createElement('a');
    link.href = doc.fileDataUrl || samplePdfDataUrl;
    link.download = doc.fileName || `${doc.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    celebrate();
    showToast(`Downloading "${doc.fileName}"...`);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    showToast('Document removed from vault');
  };

  const getExpiryStatus = (expDate?: string) => {
    if (!expDate) return { text: 'No Expiry', style: 'text-[#2d1b28] dark:text-[#e6c3db] bg-[#efd0e5] dark:bg-[#120a10] border-[#d29ec2] dark:border-[#be7fab]/30' };
    const today = new Date(2026, 10, 12);
    const [y, m, d] = expDate.split('-').map(Number);
    const exp = new Date(y, m - 1, d);
    const monthsDiff = (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsDiff < 0) return { text: 'Expired', style: 'text-[#120a10] bg-[#be7fab] border-[#be7fab] dark:border-[#efd0e5]/60' };
    if (monthsDiff < 6) return { text: 'Expiring Soon', style: 'text-[#120a10] bg-[#daabcb] border-[#be7fab]/50 dark:border-[#efd0e5]/50' };
    return { text: 'Valid & Active', style: 'text-[#2d1b28] dark:text-[#efd0e5] bg-[#e6c3db] dark:bg-[#be7fab]/25 border-[#be7fab]/55' };
  };

  const categories = ['All', 'Identification', 'Insurance', 'Property', 'Medical', 'Vehicle', 'Warranties'];

  const filteredDocs = documents.filter((doc) => {
    const matchesCat = selectedCat === 'All' || doc.category === selectedCat;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.docNumber && doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.location && doc.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1c0f19] text-[#2d1b28] dark:text-[#efd0e5] text-xs font-semibold shadow-[0_0_24px_rgba(190,127,171,0.45)] border border-[#be7fab] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#be7fab]/20 border border-[#be7fab]/45 text-[#be7fab] dark:text-[#daabcb]">
              <FolderArchive className="w-5 h-5" />
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              Document Vault &amp; File Hub
            </h1>
          </div>
          <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-1">
            Upload, preview, and download vital PDF documents, insurance policies, safe locations, and warranties
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_16px_rgba(190,127,171,0.4)] transition-all active:scale-95"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload / Archive File</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="hud-panel p-1 max-w-fit flex items-center gap-1 text-xs font-semibold overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                selectedCat === cat
                  ? 'bg-[#be7fab] text-[#120a10] shadow-[0_0_10px_rgba(190,127,171,0.4)] font-bold'
                  : 'text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#be7fab] dark:text-[#daabcb]" />
          <input
            type="text"
            placeholder="Search documents or safe location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#1c0f19] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
          />
        </div>
      </div>

      {/* Documents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => {
          const status = getExpiryStatus(doc.expirationDate);

          return (
            <div
              key={doc.id}
              className="hud-panel hud-corners washi-tape-top p-4 sm:p-5 flex flex-col justify-between transition-all group relative"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-[#d29ec2]/50 dark:border-[#be7fab]/25 gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="p-2 rounded-xl bg-[#be7fab]/20 border border-[#be7fab]/40 text-[#be7fab] dark:text-[#daabcb] shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] uppercase tracking-wide font-mono block">
                        {doc.category} · {doc.fileSize}
                      </span>
                      <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] leading-snug mt-0.5 truncate">
                        {doc.title}
                      </h3>
                      <span className="text-[11px] text-[#2d1b28]/65 dark:text-[#e6c3db]/70 font-mono block truncate">
                        {doc.fileName}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${status.style}`}>
                    {status.text}
                  </span>
                </div>

                <div className="my-3 space-y-1.5 text-xs text-[#2d1b28]/85 dark:text-[#e6c3db] font-mono tabular-nums">
                  {doc.docNumber && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#2d1b28]/65 dark:text-[#d29ec2]/75">Record #:</span>
                      <code className="bg-[#e6c3db]/70 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/30 px-1.5 py-0.5 rounded text-[11px] text-[#2d1b28] dark:text-[#efd0e5]">
                        {doc.docNumber}
                      </code>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[#2d1b28] dark:text-[#efd0e5]">
                    <MapPin className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb] shrink-0" />
                    <span className="font-sans">
                      Physical Vault: <strong className="text-[#2d1b28] dark:text-[#efd0e5]">{doc.location}</strong>
                    </span>
                  </div>

                  {doc.expirationDate && (
                    <div className="flex items-center gap-1.5 text-[#2d1b28]/75 dark:text-[#e6c3db]/85">
                      <Calendar className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb] shrink-0" />
                      <span>Expires: {doc.expirationDate}</span>
                    </div>
                  )}
                </div>

                {doc.notes && (
                  <div className="p-2 rounded-xl bg-[#e6c3db]/55 dark:bg-[#120a10]/75 border border-[#d29ec2]/50 dark:border-[#be7fab]/20 text-[11px] text-[#2d1b28]/80 dark:text-[#e6c3db]/80 italic leading-snug mb-3">
                    {doc.notes}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#d29ec2]/45 dark:border-[#be7fab]/20 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#e6c3db]/70 dark:bg-[#120a10] hover:bg-[#be7fab]/25 text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg transition-colors"
                    title="Preview file"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => handleDownloadFile(doc)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-[#be7fab] hover:bg-[#d29ec2] text-[#120a10] rounded-lg transition-colors"
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>

                <button
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#2d1b28]/55 dark:text-[#d29ec2]/70 hover:text-[#be7fab] dark:hover:text-[#efd0e5] rounded transition-opacity"
                  title="Remove document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredDocs.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/75 bg-white/75 dark:bg-[#1c0f19]/60 rounded-2xl border border-dashed border-[#be7fab]/45 dark:border-[#be7fab]/35">
            No documents found matching this filter. Tap &quot;Upload / Archive File&quot; to add one!
          </div>
        )}
      </div>

      {/* MODAL: FILE PREVIEW */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/60 dark:bg-[#120a10]/85 backdrop-blur-sm">
          <div className="hud-panel hud-corners w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-start justify-between pb-3 border-b border-[#d29ec2]/50 dark:border-[#be7fab]/25">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb]">
                    <FileText className="w-4 h-4" />
                  </span>
                  <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                    {previewDoc.title}
                  </h3>
                </div>
                <span className="text-xs text-[#2d1b28]/70 dark:text-[#e6c3db]/75 font-mono mt-0.5 block">
                  {previewDoc.fileName} · {previewDoc.fileSize} · Location: {previewDoc.location}
                </span>
              </div>

              <button onClick={() => setPreviewDoc(null)} className="text-[#2d1b28]/70 dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 flex-1 min-h-[280px] max-h-[460px] overflow-y-auto bg-[#efd0e5]/45 dark:bg-[#120a10] rounded-xl border border-[#d29ec2] dark:border-[#be7fab]/35 p-4 font-mono text-xs text-[#2d1b28] dark:text-[#efd0e5] leading-relaxed">
              {previewDoc.fileDataUrl?.startsWith('data:image/') ? (
                <div className="flex justify-center items-center h-full">
                  <img
                    src={previewDoc.fileDataUrl}
                    alt={previewDoc.title}
                    className="max-h-[400px] object-contain rounded-lg shadow-xs"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-[#1c0f19] rounded-lg border border-[#d29ec2] dark:border-[#be7fab]/40">
                    <div className="flex items-center justify-between pb-2 border-b border-[#d29ec2]/50 dark:border-[#be7fab]/25 text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                      <span>DOCUMENT CERTIFICATE &amp; RECORD SPECIFICATION</span>
                      <span className="text-[#be7fab] dark:text-[#daabcb]">VERIFIED ARCHIVED</span>
                    </div>
                    <div className="mt-3 space-y-2 text-xs text-[#2d1b28]/85 dark:text-[#e6c3db]">
                      <div>
                        <strong className="text-[#2d1b28] dark:text-[#efd0e5]">Document Name:</strong> {previewDoc.title}
                      </div>
                      <div>
                        <strong className="text-[#2d1b28] dark:text-[#efd0e5]">Filename:</strong> {previewDoc.fileName}
                      </div>
                      <div>
                        <strong className="text-[#2d1b28] dark:text-[#efd0e5]">Category:</strong> {previewDoc.category}
                      </div>
                      {previewDoc.docNumber && (
                        <div>
                          <strong className="text-[#2d1b28] dark:text-[#efd0e5]">Record/Policy #:</strong> {previewDoc.docNumber}
                        </div>
                      )}
                      {previewDoc.expirationDate && (
                        <div>
                          <strong className="text-[#2d1b28] dark:text-[#efd0e5]">Expiration Date:</strong> {previewDoc.expirationDate}
                        </div>
                      )}
                      <div>
                        <strong className="text-[#2d1b28] dark:text-[#efd0e5]">Storage Vault:</strong> {previewDoc.location}
                      </div>
                      {previewDoc.notes && (
                        <div>
                          <strong className="text-[#2d1b28] dark:text-[#efd0e5]">Notes:</strong> {previewDoc.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-[#e6c3db]/75 dark:bg-[#be7fab]/15 border border-[#be7fab]/40 rounded-lg text-[11px] text-[#2d1b28] dark:text-[#efd0e5] font-sans">
                    <strong>Vault Security:</strong> Stored locally inside your encrypted command vault for instant offline access and cross-device JSON export.
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/25 flex items-center justify-between">
              <span className="text-xs text-[#2d1b28]/65 dark:text-[#d29ec2]/75 font-mono">
                Uploaded: {previewDoc.uploadedAt}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-3 py-1.5 text-xs font-medium text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadFile(previewDoc)}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD / ARCHIVE DOCUMENT */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
          <div className="hud-panel hud-corners w-full max-w-md p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/50 dark:border-[#be7fab]/25">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb]">
                  <Upload className="w-4 h-4" />
                </span>
                <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                  Upload &amp; Register Document
                </h3>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-[#2d1b28]/70 dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Select File (PDF, Image, Scan)
                </label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#be7fab]/55 hover:border-[#be7fab] dark:hover:border-[#efd0e5] rounded-xl bg-[#efd0e5]/45 dark:bg-[#120a10] cursor-pointer transition-colors group">
                  <Upload className="w-6 h-6 text-[#be7fab] dark:text-[#daabcb] mb-1" />
                  <span className="text-xs font-semibold text-[#2d1b28] dark:text-[#efd0e5]">
                    {uploadedFileName || 'Choose file from your device'}
                  </span>
                  <span className="text-[10px] text-[#2d1b28]/65 dark:text-[#e6c3db]/70 mt-0.5">
                    Supports .pdf, .jpg, .png, .txt (Preview &amp; download enabled)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/*,.doc,.docx,.txt"
                    onChange={handleFileChosen}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Home Deed, Pet Microchip Certificate"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Category
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as DocumentVaultItem['category'])}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  >
                    <option value="Identification">Identification</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Property">Property</option>
                    <option value="Medical">Medical</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Warranties">Warranties</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Record / Policy #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. POL-99214"
                    value={docRecordNum}
                    onChange={(e) => setDocRecordNum(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={docExpDate}
                    onChange={(e) => setDocExpDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Physical Vault Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fireproof Safe - Drawer 1"
                    value={docLocation}
                    onChange={(e) => setDocLocation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Notes &amp; Details
                </label>
                <textarea
                  placeholder="Renewal agent, coverage summary, etc."
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#d29ec2]/45 dark:border-[#be7fab]/20">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg"
                >
                  Archive Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
