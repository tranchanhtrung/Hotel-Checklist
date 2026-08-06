import React, { useState } from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Filter, 
  Calendar, 
  ArrowRight,
  Image as ImageIcon,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { MaintenanceTicket, SeverityLevel, TicketStatus } from '../types';
import { Camera, Upload, Trash2 } from 'lucide-react';
import { resizeImage } from '../utils/imageUtils';

interface MaintenanceTrackerProps {
  tickets: MaintenanceTicket[];
  onUpdateTicket: (updatedTicket: MaintenanceTicket) => void;
}

export const MaintenanceTracker: React.FC<MaintenanceTrackerProps> = ({
  tickets,
  onUpdateTicket,
}) => {
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const KANBAN_COLUMNS: { status: TicketStatus; label: string; color: string }[] = [
    { status: 'NEW', label: 'Mới Tạo', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { status: 'ASSIGNED', label: 'Đã Giao Kỹ Thuật', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { status: 'IN_PROGRESS', label: 'Đang Xử Lý', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { status: 'PENDING_REVIEW', label: 'Chờ Nghiệm Thu', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { status: 'COMPLETED', label: 'Hoàn Tất', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ];

  const filteredTickets = tickets.filter((t) => {
    if (filterSeverity !== 'ALL' && t.severity !== filterSeverity) return false;
    return true;
  });

  const handleQuickStatusChange = (ticket: MaintenanceTicket, newStatus: TicketStatus) => {
    const updated = {
      ...ticket,
      status: newStatus,
      completedDate: newStatus === 'COMPLETED' ? new Date().toISOString() : ticket.completedDate,
    };
    onUpdateTicket(updated);
    if (selectedTicket?.id === ticket.id) {
      setSelectedTicket(updated);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Theo Dõi Tiến Độ Sửa Chữa & Bảo Trì</h1>
          <p className="text-xs text-slate-500">Bảng Kanban quản lý phiếu khắc phục sự cố phòng ốc theo thời gian thực</p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Mức độ:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-slate-50"
          >
            <option value="ALL">Tất Cả Mức Độ</option>
            <option value="CRITICAL">🔴 Nghiêm Trọng</option>
            <option value="HIGH">🟠 Cao</option>
            <option value="MEDIUM">🟡 Trung Bình</option>
            <option value="LOW">⚪ Thấp</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => {
          const colTickets = filteredTickets.filter((t) => t.status === col.status);

          return (
            <div key={col.status} className="bg-slate-100/70 p-3 rounded-2xl border border-slate-200/80 min-w-[240px] space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md border ${col.color}`}>
                  {col.label}
                </span>
                <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {colTickets.length}
                </span>
              </div>

              {/* Cards in Column */}
              <div className="space-y-3 min-h-[300px]">
                {colTickets.map((ticket) => {
                  let sevBg = 'bg-slate-100 text-slate-700';
                  if (ticket.severity === 'HIGH' || ticket.severity === 'CRITICAL')
                    sevBg = 'bg-rose-100 text-rose-800 font-bold';
                  else if (ticket.severity === 'MEDIUM')
                    sevBg = 'bg-amber-100 text-amber-800 font-bold';

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-slate-400">{ticket.ticketCode}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${sevBg}`}>
                          {ticket.severity}
                        </span>
                      </div>

                      <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">
                        {ticket.roomNumber} - {ticket.itemTitle}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{ticket.description}</p>

                      {(() => {
                        const isReviewOrCompleted = ticket.status === 'PENDING_REVIEW' || ticket.status === 'COMPLETED';
                        const displayPhoto = isReviewOrCompleted && ticket.afterPhotoUrl ? ticket.afterPhotoUrl : ticket.beforePhotoUrl;
                        const badgeText = isReviewOrCompleted && ticket.afterPhotoUrl ? 'Ảnh nghiệm thu' : 'Ảnh sự cố (lỗi)';
                        const badgeStyle = isReviewOrCompleted && ticket.afterPhotoUrl ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-900/70 text-white';

                        if (!displayPhoto) return null;

                        return (
                          <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 h-20 bg-slate-100 relative">
                            <img src={displayPhoto} alt={badgeText} className="w-full h-full object-cover" />
                            <div className={`absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded font-medium shadow-xs ${badgeStyle}`}>
                              {badgeText}
                            </div>
                          </div>
                        );
                      })()}

                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                        <span className="truncate max-w-[120px] font-medium text-slate-700">
                          👤 {ticket.assigneeName || 'Chưa giao'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  );
                })}

                {colTickets.length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-xs italic">
                    Không có phiếu ở trạng thái này
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedTicket.ticketCode}
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  {selectedTicket.roomNumber} - {selectedTicket.itemTitle}
                </h2>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Mô Tả Sự Cố
                </label>
                <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Photos Comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Ảnh Trước Sửa (Lỗi)
                  </label>
                  {selectedTicket.beforePhotoUrl ? (
                    <img
                      src={selectedTicket.beforePhotoUrl}
                      alt="Before defect"
                      className="w-full h-28 object-cover rounded-xl border border-slate-200"
                    />
                  ) : (
                    <div className="h-28 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400 italic">
                      Không có ảnh
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Ảnh Sau Sửa (Nghiệm Thu)
                  </label>
                  {selectedTicket.afterPhotoUrl ? (
                    <div className="relative group">
                      <img
                        src={selectedTicket.afterPhotoUrl}
                        alt="After fix"
                        className="w-full h-28 object-cover rounded-xl border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...selectedTicket, afterPhotoUrl: undefined };
                          onUpdateTicket(updated);
                          setSelectedTicket(updated);
                        }}
                        className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-full shadow hover:bg-rose-700 transition"
                        title="Xóa ảnh nghiệm thu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-28 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-xs text-slate-500 p-2 space-y-1.5">
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                      <div className="flex items-center space-x-1.5">
                        <label className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold cursor-pointer hover:bg-blue-500 transition flex items-center gap-1">
                          <Camera className="w-3 h-3" /> Chụp
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const scaled = await resizeImage(file);
                                const updated = { ...selectedTicket, afterPhotoUrl: scaled };
                                onUpdateTicket(updated);
                                setSelectedTicket(updated);
                              }
                            }}
                          />
                        </label>
                        <label className="px-2 py-1 bg-slate-700 text-white rounded text-[10px] font-bold cursor-pointer hover:bg-slate-600 transition flex items-center gap-1">
                          <Upload className="w-3 h-3" /> Chọn file
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const scaled = await resizeImage(file);
                                const updated = { ...selectedTicket, afterPhotoUrl: scaled };
                                onUpdateTicket(updated);
                                setSelectedTicket(updated);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignee & Status Controls */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800">Cập Nhật Trạng Thái Phiếu</label>
                <div className="grid grid-cols-2 gap-2">
                  {KANBAN_COLUMNS.map((col) => (
                    <button
                      key={col.status}
                      onClick={() => handleQuickStatusChange(selectedTicket, col.status)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
                        selectedTicket.status === col.status
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border-blue-600'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
