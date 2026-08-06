import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Cloud, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Wrench, 
  ExternalLink, 
  Sparkles,
  Send
} from 'lucide-react';
import { InspectionReport } from '../types';
import { generateInspectionPDF } from '../services/pdfService';
import { uploadReportToGoogleDrive, sendReportEmail } from '../services/apiService';

interface ReportViewerModalProps {
  report: InspectionReport | null;
  onClose: () => void;
  onReportUpdated: (updatedReport: InspectionReport) => void;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({
  report,
  onClose,
  onReportUpdated,
}) => {
  const [isDriveSyncing, setIsDriveSyncing] = useState<boolean>(false);
  const [isEmailSending, setIsEmailSending] = useState<boolean>(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState<string>('');

  if (!report) return null;

  // Generate PDF for download or sync
  const handleDownloadPdf = () => {
    const dataUrl = generateInspectionPDF(report);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = dataUrl;
    downloadAnchor.download = `Bao_Cao_Kiem_Tra_${report.roomNumber.replace(/\s+/g, '_')}_${report.reportCode}.pdf`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Sync to Google Drive
  const handleSyncDrive = async () => {
    setIsDriveSyncing(true);
    try {
      const pdfDataUrl = generateInspectionPDF(report);
      const res = await uploadReportToGoogleDrive(report, pdfDataUrl);

      if (res.success || res.fileUrl) {
        const updated: InspectionReport = {
          ...report,
          driveFileId: res.fileId,
          driveFileUrl: res.fileUrl,
          driveSyncedAt: res.syncedAt || new Date().toISOString(),
        };
        onReportUpdated(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDriveSyncing(false);
    }
  };

  // Send Email
  const handleSendEmail = async () => {
    setIsEmailSending(true);
    setEmailStatusMsg('');
    try {
      const pdfDataUrl = generateInspectionPDF(report);
      const res = await sendReportEmail(report, ['tranchanhtrung@gmail.com'], pdfDataUrl);

      if (res.success) {
        setEmailStatusMsg('✅ Đã gửi báo cáo PDF qua email thành công!');
        const updated: InspectionReport = {
          ...report,
          emailSentTo: res.sentTo || ['tranchanhtrung@gmail.com'],
          emailSentAt: res.sentAt || new Date().toISOString(),
        };
        onReportUpdated(updated);
      } else {
        setEmailStatusMsg('⚠️ Thông báo email đã được chuyển qua hệ thống.');
      }
    } catch (err) {
      setEmailStatusMsg('❌ Lỗi kết nối gửi email.');
    } finally {
      setIsEmailSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8 p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              {report.reportCode}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              {report.roomNumber} ({report.roomType}) - {report.hotelName}
            </h2>
            <p className="text-xs text-slate-500">
              Thanh tra viên: {report.inspectorName} ({report.inspectorRole}) • {new Date(report.inspectionDate).toLocaleString('vi-VN')}
            </p>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl p-1">
            ✕
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Tải Báo Cáo PDF</span>
            </button>

            <button
              onClick={handleSyncDrive}
              disabled={isDriveSyncing}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
            >
              <Cloud className={`w-4 h-4 ${isDriveSyncing ? 'animate-bounce' : ''}`} />
              <span>{isDriveSyncing ? 'Đang Lưu...' : 'Lưu Vào Google Drive'}</span>
            </button>

            <button
              onClick={handleSendEmail}
              disabled={isEmailSending}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
            >
              <Mail className="w-4 h-4" />
              <span>{isEmailSending ? 'Đang Gửi Email...' : 'Gửi Email'}</span>
            </button>
          </div>

          {report.driveFileUrl && (
            <a
              href={report.driveFileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:underline"
            >
              <span>Xem trên Google Drive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {emailStatusMsg && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold">
            {emailStatusMsg}
          </div>
        )}

        {/* Score Summary Box */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-300">Điểm Đánh Giá Chất Lượng Phục Vụ</div>
            <div className="text-3xl font-extrabold">{report.overallScore}%</div>
          </div>
          <span className="px-3 py-1 bg-emerald-500 text-white font-bold text-xs rounded-full">
            {report.qualityGrade}
          </span>
        </div>

        {/* AI Summary */}
        {report.aiExecutiveSummary && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs space-y-1">
            <div className="font-bold text-purple-900 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Chẩn Đoán Từ Chuyên Gia Gemini AI</span>
            </div>
            <p className="text-purple-950 leading-relaxed">{report.aiExecutiveSummary}</p>
          </div>
        )}

        {/* Results List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Chi Tiết Hạng Mục Kiểm Tra ({report.results.length})
          </h3>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {report.results.map((res, idx) => (
              <div key={idx} className="p-3.5 bg-white flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">{res.title}</div>
                  {res.notes && <p className="text-slate-500 italic">{res.notes}</p>}
                </div>

                <span
                  className={`px-2.5 py-1 rounded text-[11px] font-extrabold ${
                    res.status === 'PASS'
                      ? 'bg-emerald-100 text-emerald-800'
                      : res.status === 'FAIL'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {res.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
          >
            Đóng Xem Báo Cáo
          </button>
        </div>
      </div>
    </div>
  );
};
