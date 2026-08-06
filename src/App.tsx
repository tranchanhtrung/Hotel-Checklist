import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { InspectionRunner } from './components/InspectionRunner';
import { ChecklistBuilder } from './components/ChecklistBuilder';
import { MaintenanceTracker } from './components/MaintenanceTracker';
import { RoomDirectory } from './components/RoomDirectory';
import { ReportViewerModal } from './components/ReportViewerModal';
import { ScheduleModal } from './components/ScheduleModal';

import { 
  INITIAL_TEMPLATES, 
  INITIAL_ROOMS, 
  INITIAL_REPORTS, 
  INITIAL_TICKETS, 
  DEFAULT_SCHEDULE_CONFIG 
} from './data/initialData';

import { 
  ChecklistTemplate, 
  HotelRoom, 
  InspectionReport, 
  MaintenanceTicket, 
  ScheduleConfig 
} from './types';

import { uploadReportToGoogleDrive, sendReportEmail } from './services/apiService';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core State with Local Storage fallback
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(() => {
    const saved = localStorage.getItem('hotel_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  const [rooms, setRooms] = useState<HotelRoom[]>(() => {
    const saved = localStorage.getItem('hotel_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [reports, setReports] = useState<InspectionReport[]>(() => {
    const saved = localStorage.getItem('hotel_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => {
    const saved = localStorage.getItem('hotel_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(() => {
    const saved = localStorage.getItem('hotel_schedule');
    return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE_CONFIG;
  });

  // UI Modals & Inspections Target
  const [selectedReportForView, setSelectedReportForView] = useState<InspectionReport | null>(null);
  const [inspectRoomId, setInspectRoomId] = useState<string | undefined>(undefined);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [isSyncingDrive, setIsSyncingDrive] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  // System status flags
  const [driveConnected, setDriveConnected] = useState<boolean>(true);
  const [gmailConnected, setGmailConnected] = useState<boolean>(true);
  const [aiConnected, setAiConnected] = useState<boolean>(true);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('hotel_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('hotel_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('hotel_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('hotel_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('hotel_schedule', JSON.stringify(scheduleConfig));
  }, [scheduleConfig]);

  // Check health endpoint on load
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasGeminiKey) setAiConnected(true);
      })
      .catch((err) => console.log('Health check note:', err));
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Launch inspection for a specific room
  const handleStartInspectionForRoom = (roomId?: string) => {
    setInspectRoomId(roomId);
    setActiveTab('inspect');
  };

  // Completed New Inspection Handler
  const handleCompleteInspection = async (newReport: InspectionReport, pdfDataUrl: string) => {
    // 1. Save Report to state
    setReports((prev) => [newReport, ...prev]);

    // 2. Auto Create Maintenance Tickets for failed or maintenance items
    const newTicketsToCreate: MaintenanceTicket[] = [];
    newReport.results.forEach((item, idx) => {
      if (item.status === 'FAIL' || item.status === 'MAINTENANCE') {
        const ticketCode = `TKT-${newReport.roomNumber.replace(/[^0-9]/g, '') || '101'}-0${idx + 1}`;
        newTicketsToCreate.push({
          id: `tkt-${Date.now()}-${idx}`,
          ticketCode,
          inspectionReportId: newReport.id,
          roomNumber: newReport.roomNumber,
          categoryTitle: 'Hạng mục kiểm tra phòng',
          itemTitle: item.title,
          description: item.notes || item.aiRecommendation || 'Sự cố phát hiện qua lượt kiểm tra chất lượng.',
          severity: item.severity || (item.status === 'FAIL' ? 'HIGH' : 'MEDIUM'),
          status: 'NEW',
          assigneeName: 'Chưa phân công',
          assigneeDepartment: 'Engineering',
          reportedDate: new Date().toISOString(),
          beforePhotoUrl: item.photoUrls && item.photoUrls.length > 0 ? item.photoUrls[0] : undefined,
        });
      }
    });

    if (newTicketsToCreate.length > 0) {
      setTickets((prev) => [...newTicketsToCreate, ...prev]);
    }

    // 3. Update Room Status
    setRooms((prev) =>
      prev.map((r) => {
        if (r.roomNumber === newReport.roomNumber) {
          return {
            ...r,
            lastInspectedDate: newReport.inspectionDate,
            lastScore: newReport.overallScore,
            status: newReport.overallScore < 85 ? 'NEEDS_MAINTENANCE' : 'READY',
          };
        }
        return r;
      })
    );

    showToast(`🎉 Đã tạo báo cáo ${newReport.reportCode}! Đang sao lưu Google Drive...`);

    // 4. Trigger Drive Upload Asynchronously
    try {
      const driveRes = await uploadReportToGoogleDrive(newReport, pdfDataUrl);
      if (driveRes.success) {
        const updatedReport: InspectionReport = {
          ...newReport,
          driveFileId: driveRes.fileId,
          driveFileUrl: driveRes.fileUrl,
          driveSyncedAt: driveRes.syncedAt || new Date().toISOString(),
        };

        setReports((prev) => prev.map((r) => (r.id === newReport.id ? updatedReport : r)));

        // Send Email if configured
        sendReportEmail(updatedReport, scheduleConfig.recipients, pdfDataUrl);
      }
    } catch (err) {
      console.error(err);
    }

    // Open Report View
    setSelectedReportForView(newReport);
    setActiveTab('dashboard');
  };

  // Sync all unsynced reports to Google Drive
  const handleSyncAllDrive = async () => {
    setIsSyncingDrive(true);
    let count = 0;
    try {
      for (const rep of reports) {
        if (!rep.driveSyncedAt) {
          const res = await uploadReportToGoogleDrive(rep);
          if (res.success) {
            count++;
            setReports((prev) =>
              prev.map((r) =>
                r.id === rep.id
                  ? { ...r, driveFileId: res.fileId, driveFileUrl: res.fileUrl, driveSyncedAt: new Date().toISOString() }
                  : r
              )
            );
          }
        }
      }
      showToast(count > 0 ? `✅ Đã đồng bộ ${count} báo cáo lên Google Drive!` : '✅ Tất cả báo cáo đã được sao lưu Drive.');
    } catch (err) {
      console.error(err);
      showToast('❌ Không thể kết nối Google Drive.');
    } finally {
      setIsSyncingDrive(false);
    }
  };

  // Trigger Gmail notification / report email
  const handleTriggerGmail = async () => {
    if (reports.length === 0) {
      showToast('⚠️ Chưa có báo cáo kiểm tra nào để gửi qua Gmail.');
      return;
    }
    const targetReport = reports[0];
    showToast(`📧 Đang kích hoạt gửi mail báo cáo ${targetReport.reportCode} qua Gmail...`);
    try {
      const res = await sendReportEmail(targetReport, scheduleConfig.recipients);
      if (res.success) {
        showToast(`✅ Đã gửi báo cáo ${targetReport.reportCode} qua Gmail tới ${scheduleConfig.recipients[0] || 'Ban Quản Lý'}!`);
      } else {
        showToast(`✉️ Đã kích hoạt hệ thống gửi mail báo cáo qua Gmail.`);
      }
    } catch (err) {
      showToast('❌ Không thể kết nối dịch vụ Gmail.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-200">
          {toastMsg}
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openScheduleModal={() => setIsScheduleModalOpen(true)}
        driveConnected={driveConnected}
        gmailConnected={gmailConnected}
        aiConnected={aiConnected}
        onSyncDrive={handleSyncAllDrive}
        onSendGmail={handleTriggerGmail}
        isSyncingDrive={isSyncingDrive}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            reports={reports}
            tickets={tickets}
            rooms={rooms}
            onStartInspection={handleStartInspectionForRoom}
            onViewReport={(rep) => setSelectedReportForView(rep)}
            onGoToMaintenance={() => setActiveTab('maintenance')}
            onSyncAllDrive={handleSyncAllDrive}
            isSyncingDrive={isSyncingDrive}
          />
        )}

        {activeTab === 'inspect' && (
          <InspectionRunner
            templates={templates}
            rooms={rooms}
            initialRoomId={inspectRoomId}
            onCompleteInspection={handleCompleteInspection}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'templates' && (
          <ChecklistBuilder
            templates={templates}
            onSaveTemplate={(newTpl) => {
              setTemplates((prev) => {
                const idx = prev.findIndex((t) => t.id === newTpl.id);
                if (idx >= 0) {
                  const copy = [...prev];
                  copy[idx] = newTpl;
                  return copy;
                }
                return [newTpl, ...prev];
              });
              showToast('✅ Đã lưu mẫu checklist!');
            }}
            onDeleteTemplate={(id) => {
              setTemplates((prev) => prev.filter((t) => t.id !== id));
            }}
          />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceTracker
            tickets={tickets}
            onUpdateTicket={(updatedTkt) => {
              setTickets((prev) => prev.map((t) => (t.id === updatedTkt.id ? updatedTkt : t)));
              showToast(`✅ Đã cập nhật phiếu ${updatedTkt.ticketCode}`);
            }}
          />
        )}

        {activeTab === 'rooms' && (
          <RoomDirectory
            rooms={rooms}
            onStartInspection={handleStartInspectionForRoom}
            onAddRoom={(newRoom) => {
              setRooms((prev) => [newRoom, ...prev]);
              showToast(`✅ Đã thêm ${newRoom.roomNumber}!`);
            }}
            onUpdateRoom={(updatedRoom) => {
              setRooms((prev) => prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)));
              showToast(`✅ Đã cập nhật thông tin ${updatedRoom.roomNumber}!`);
            }}
            onDeleteRoom={(roomId) => {
              setRooms((prev) => prev.filter((r) => r.id !== roomId));
              showToast(`🗑️ Đã xóa khu vực!`);
            }}
          />
        )}
      </main>

      {/* Report Viewer Modal */}
      {selectedReportForView && (
        <ReportViewerModal
          report={selectedReportForView}
          onClose={() => setSelectedReportForView(null)}
          onReportUpdated={(updated) => {
            setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            setSelectedReportForView(updated);
          }}
        />
      )}

      {/* Schedule Settings Modal */}
      {isScheduleModalOpen && (
        <ScheduleModal
          config={scheduleConfig}
          onClose={() => setIsScheduleModalOpen(false)}
          onSaveConfig={(updated) => {
            setScheduleConfig(updated);
            showToast('✅ Đã cập nhật cấu hình gửi báo cáo định kỳ!');
          }}
        />
      )}
    </div>
  );
}
