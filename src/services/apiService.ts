import { InspectionReport } from '../types';

export interface DefectAIAnalysisResponse {
  aiSummary: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendedAction: string;
  assignedDepartment: string;
  estimatedRepairMinutes: number;
}

export async function analyzeDefectWithAI(payload: {
  itemTitle: string;
  standardRequirement?: string;
  notes: string;
  photoBase64?: string;
  hotelName?: string;
  roomNumber?: string;
}): Promise<DefectAIAnalysisResponse> {
  try {
    const res = await fetch('/api/gemini/analyze-defect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success && data.result) {
      return data.result;
    }
    return data.fallback || {
      aiSummary: 'Cần kiểm tra sự cố tại chỗ.',
      severity: 'MEDIUM',
      recommendedAction: 'Tạo phiếu yêu cầu bảo trì kỹ thuật.',
      assignedDepartment: 'Engineering',
      estimatedRepairMinutes: 30,
    };
  } catch (error) {
    console.error('API Error analyzeDefectWithAI:', error);
    return {
      aiSummary: 'Đã lưu ghi chú kiểm tra.',
      severity: 'MEDIUM',
      recommendedAction: 'Gửi thông báo cho bộ phận sửa chữa.',
      assignedDepartment: 'Engineering',
      estimatedRepairMinutes: 30,
    };
  }
}

export async function uploadReportToGoogleDrive(report: InspectionReport, pdfBase64?: string) {
  try {
    const res = await fetch('/api/drive/upload-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report, pdfBase64 }),
    });
    return await res.json();
  } catch (error) {
    console.error('API Error uploadReportToGoogleDrive:', error);
    return {
      success: false,
      fileUrl: 'https://drive.google.com/',
      note: 'Lỗi kết nối server, đành lưu dữ liệu trong bộ nhớ tạm.',
    };
  }
}

export async function sendReportEmail(report: InspectionReport, recipients: string[], pdfBase64?: string) {
  try {
    const res = await fetch('/api/gmail/send-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report, recipients, pdfBase64 }),
    });
    return await res.json();
  } catch (error) {
    console.error('API Error sendReportEmail:', error);
    return {
      success: false,
      note: 'Lỗi gửi email server.',
    };
  }
}
