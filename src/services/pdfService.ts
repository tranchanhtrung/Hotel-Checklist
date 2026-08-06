import jsPDF from 'jspdf';
import { InspectionReport } from '../types';

export function generateInspectionPDF(report: InspectionReport): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Header Banner
  doc.setFillColor(30, 58, 138); // Dark Navy Blue
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(report.hotelName.toUpperCase(), 14, 12);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('HOTEL INSPECTION & QUALITY ASSURANCE REPORT', 14, 20);

  doc.setFontSize(10);
  doc.text(`Report ID: ${report.reportCode}`, pageWidth - 14, 20, { align: 'right' });

  y = 36;

  // Key Details Grid
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 28, 3, 3, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Room / Area: ${report.roomNumber} (${report.roomType})`, 20, y + 8);
  doc.text(`Inspector: ${report.inspectorName} - ${report.inspectorRole}`, 20, y + 16);
  doc.text(`Date & Time: ${new Date(report.inspectionDate).toLocaleString('vi-VN')}`, 20, y + 23);

  // Score Box on Right
  let scoreColor = [34, 197, 94]; // Green
  if (report.overallScore < 80) scoreColor = [239, 68, 68]; // Red
  else if (report.overallScore < 90) scoreColor = [245, 158, 11]; // Yellow

  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.roundedRect(pageWidth - 65, y + 4, 45, 20, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${report.overallScore}%`, pageWidth - 42.5, y + 13, { align: 'center' });
  doc.setFontSize(8);
  doc.text(report.qualityGrade, pageWidth - 42.5, y + 19, { align: 'center' });

  y += 36;

  // Executive Summary
  if (report.aiExecutiveSummary || report.summaryNotes) {
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'FD');

    doc.setTextColor(30, 58, 138);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('EXECUTIVE SUMMARY & AI DIAGNOSIS', 18, y + 6);

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const summaryText = report.aiExecutiveSummary || report.summaryNotes || '';
    const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 36);
    doc.text(splitSummary, 18, y + 12);

    y += 28;
  }

  // Checklist Items Table
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, pageWidth - 28, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CHECKLIST ITEM', 18, y + 5.5);
  doc.text('STATUS', pageWidth - 70, y + 5.5);
  doc.text('NOTES / DEFECT', pageWidth - 40, y + 5.5);

  y += 8;

  report.results.forEach((item, index) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(index % 2 === 0 ? 255 : 248, 250, 252);
    doc.rect(14, y, pageWidth - 28, 10, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 10, pageWidth - 14, y + 10);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${item.title.substring(0, 38)}`, 18, y + 6);

    // Status Badge
    let stBg = [220, 252, 231];
    let stTxt = [21, 128, 61];
    let stName = 'PASS';

    if (item.status === 'FAIL') {
      stBg = [254, 226, 226];
      stTxt = [185, 28, 28];
      stName = 'FAIL';
    } else if (item.status === 'MAINTENANCE') {
      stBg = [254, 243, 199];
      stTxt = [180, 83, 9];
      stName = 'REPAIR';
    } else if (item.status === 'NA') {
      stBg = [241, 245, 249];
      stTxt = [100, 116, 139];
      stName = 'N/A';
    }

    doc.setFillColor(stBg[0], stBg[1], stBg[2]);
    doc.roundedRect(pageWidth - 72, y + 2, 18, 6, 1, 1, 'F');
    doc.setTextColor(stTxt[0], stTxt[1], stTxt[2]);
    doc.setFontSize(7.5);
    doc.text(stName, pageWidth - 63, y + 6, { align: 'center' });

    // Item note
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const itemNote = item.notes ? item.notes.substring(0, 32) : '-';
    doc.text(itemNote, pageWidth - 48, y + 6);

    y += 10;
  });

  y += 15;
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  // Signature Block
  doc.setDrawColor(203, 213, 225);
  doc.line(20, y + 20, 70, y + 20);
  doc.line(pageWidth - 70, y + 20, pageWidth - 20, y + 20);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('INSPECTOR SIGNATURE', 45, y + 25, { align: 'center' });
  doc.text('HOTEL MANAGER APPROVAL', pageWidth - 45, y + 25, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.text(report.inspectorName, 45, y + 30, { align: 'center' });

  // Return base64 string
  return doc.output('datauristring');
}
