import React from 'react';
import { 
  ClipboardCheck, 
  LayoutDashboard, 
  Wrench, 
  ListTodo, 
  BedDouble, 
  CalendarClock, 
  CloudCheck, 
  Mail, 
  Sparkles,
  Hotel
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openScheduleModal: () => void;
  driveConnected: boolean;
  gmailConnected: boolean;
  aiConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openScheduleModal,
  driveConnected,
  gmailConnected,
  aiConnected,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
    { id: 'inspect', label: 'Bắt Đầu Kiểm Tra', icon: ClipboardCheck },
    { id: 'maintenance', label: 'Tiến Độ Sửa Chữa', icon: Wrench },
    { id: 'templates', label: 'Mẫu Checklist', icon: ListTodo },
    { id: 'rooms', label: 'Danh Sách Phòng', icon: BedDouble },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Hotel Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Hotel className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-wide">Grand Palace</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  5★ Luxury
                </span>
              </div>
              <p className="text-xs text-slate-400">Hệ Thống Kiểm Tra & Quản Lý Chất Lượng</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status Badges & Periodic Schedule Button */}
          <div className="flex items-center space-x-2">
            <button
              id="schedule-modal-trigger"
              onClick={openScheduleModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition"
              title="Cấu hình gửi báo cáo PDF & Google Drive định kỳ"
            >
              <CalendarClock className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Báo Cáo Định Kỳ</span>
            </button>

            {/* Cloud Drive Integration Indicator */}
            <div
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                driveConnected
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Trạng thái kết nối Google Drive Storage"
            >
              <CloudCheck className={`w-3.5 h-3.5 ${driveConnected ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="hidden lg:inline">Google Drive</span>
            </div>

            {/* Gmail Integration Indicator */}
            <div
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                gmailConnected
                  ? 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Trạng thái kết nối Gmail API"
            >
              <Mail className={`w-3.5 h-3.5 ${gmailConnected ? 'text-blue-400' : 'text-slate-500'}`} />
              <span className="hidden lg:inline">Gmail</span>
            </div>

            {/* AI Gemini Status */}
            <div
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                aiConnected
                  ? 'bg-purple-950/60 text-purple-300 border-purple-800/60'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Gemini AI Chẩn đoán lỗi tự động"
            >
              <Sparkles className={`w-3.5 h-3.5 ${aiConnected ? 'text-purple-400' : 'text-slate-500'}`} />
              <span className="hidden lg:inline">Gemini AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800 px-2 py-2 bg-slate-900/95 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded text-[11px] ${
                isActive ? 'text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
