import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Wrench, 
  TrendingUp, 
  Cloud, 
  Plus, 
  Eye, 
  FileDown, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ArrowRight,
  BedDouble,
  ChefHat,
  UtensilsCrossed,
  Bath,
  Building2,
  X,
  ChevronRight,
  Info
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { InspectionReport, MaintenanceTicket, HotelRoom } from '../types';

interface DashboardProps {
  reports: InspectionReport[];
  tickets: MaintenanceTicket[];
  rooms: HotelRoom[];
  onStartInspection: (roomId?: string) => void;
  onViewReport: (report: InspectionReport) => void;
  onGoToMaintenance: () => void;
  onSyncAllDrive: () => void;
  isSyncingDrive: boolean;
}

interface SectorStats {
  title: string;
  subtitle: string;
  types: string[];
  count: number;
  avg: number;
  needsMaintenance: number;
  rooms: HotelRoom[];
  reports: InspectionReport[];
  tickets: MaintenanceTicket[];
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  badgeClass: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  reports,
  tickets,
  rooms,
  onStartInspection,
  onViewReport,
  onGoToMaintenance,
  onSyncAllDrive,
  isSyncingDrive,
}) => {
  const [selectedSectorModal, setSelectedSectorModal] = useState<SectorStats | null>(null);

  // Compute Key Stats
  const totalInspections = reports.length;
  const avgScore = reports.length > 0
    ? Math.round(reports.reduce((acc, r) => acc + r.overallScore, 0) / reports.length)
    : 0;

  const openTicketsCount = tickets.filter(t => t.status !== 'COMPLETED').length;
  const highPriorityTickets = tickets.filter(t => (t.severity === 'HIGH' || t.severity === 'CRITICAL') && t.status !== 'COMPLETED').length;
  const driveSyncedCount = reports.filter(r => r.driveSyncedAt || r.driveFileId).length;

  // Chart Data Preparation
  const chartTrendData = [
    { date: '01/08', score: 89 },
    { date: '02/08', score: 92 },
    { date: '03/08', score: 95 },
    { date: '04/08', score: 96 },
    { date: '05/08', score: avgScore || 88 },
  ];

  const categoryDefectsData = [
    { name: 'Phòng Tắm & Nước', value: 35, color: '#3b82f6' },
    { name: 'Khu Bếp & An Toàn TP', value: 25, color: '#ef4444' },
    { name: 'Nhà Hàng & F&B', value: 20, color: '#f59e0b' },
    { name: 'Nhà Vệ Sinh & Sảnh', value: 20, color: '#10b981' },
  ];

  // Sector stats calculation helper
  const getSectorStats = (
    types: string[],
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    colorClass: string,
    bgClass: string,
    badgeClass: string
  ): SectorStats => {
    const sectorRooms = rooms.filter((r) => types.includes(r.type));
    const count = sectorRooms.length;
    const scores = sectorRooms.map((r) => r.lastScore).filter((s): s is number => s !== undefined);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 95;
    const needsMaintenance = sectorRooms.filter((r) => r.status === 'NEEDS_MAINTENANCE').length;
    
    const sectorReports = reports.filter((r) => types.includes(r.roomType));
    const sectorTickets = tickets.filter((t) => {
      const room = rooms.find((r) => r.roomNumber === t.roomNumber);
      return room ? types.includes(room.type) : false;
    });

    return {
      title,
      subtitle,
      types,
      count,
      avg,
      needsMaintenance,
      rooms: sectorRooms,
      reports: sectorReports,
      tickets: sectorTickets,
      icon,
      colorClass,
      bgClass,
      badgeClass,
    };
  };

  const bedroomStats = getSectorStats(
    ['STANDARD', 'DELUXE', 'SUITE', 'PRESIDENTIAL'],
    'Phòng Ngủ Khách',
    'Bed & Living',
    <BedDouble className="w-4 h-4" />,
    'text-blue-700',
    'bg-blue-100',
    'bg-blue-50 text-blue-700 border-blue-200'
  );

  const kitchenStats = getSectorStats(
    ['KITCHEN'],
    'Khu Vực Bếp',
    'Kitchen & Food Safety',
    <ChefHat className="w-4 h-4" />,
    'text-rose-700',
    'bg-rose-100',
    'bg-rose-50 text-rose-700 border-rose-200'
  );

  const restaurantStats = getSectorStats(
    ['RESTAURANT'],
    'Nhà Hàng',
    'Buffet & Dining',
    <UtensilsCrossed className="w-4 h-4" />,
    'text-amber-700',
    'bg-amber-100',
    'bg-amber-50 text-amber-700 border-amber-200'
  );

  const restroomStats = getSectorStats(
    ['RESTROOM'],
    'Nhà Vệ Sinh',
    'Restroom Standard',
    <Bath className="w-4 h-4" />,
    'text-emerald-700',
    'bg-emerald-100',
    'bg-emerald-50 text-emerald-700 border-emerald-200'
  );

  const publicAreaStats = getSectorStats(
    ['PUBLIC_AREA'],
    'Khu Vực Công Cộng',
    'Lobby & Hallways',
    <Building2 className="w-4 h-4" />,
    'text-indigo-700',
    'bg-indigo-100',
    'bg-indigo-50 text-indigo-700 border-indigo-200'
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Hệ Thống Tự Động Hóa Kiểm Tra Khách Sạn</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Quản Lý Tiêu Chuẩn & Chất Lượng Khách Sạn
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Kiểm tra nhanh phòng ốc, tự động tạo phiếu sửa chữa bảo trì, xuất báo cáo PDF chuyên nghiệp và lưu trữ an toàn trên Google Drive.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dash-start-inspect-btn"
              onClick={() => onStartInspection()}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/40 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Kiểm Tra Phòng Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Chất Lượng Bình Quân</span>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{avgScore}%</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Đạt chuẩn 5 sao
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Dựa trên {totalInspections} lượt kiểm tra gần nhất</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lượt Kiểm Tra</span>
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{totalInspections}</span>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {rooms.length} phòng & khu vực
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Đã lưu trữ toàn bộ lịch sử</p>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={onGoToMaintenance}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phiếu Sửa Chữa Mở</span>
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{openTicketsCount}</span>
            {highPriorityTickets > 0 && (
              <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {highPriorityTickets} Khẩn cấp
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Đang chờ kỹ thuật xử lý</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition" />
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Google Drive Storage</span>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Cloud className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{driveSyncedCount}</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Đã sao lưu
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Đảm bảo an toàn & xuất PDF</p>
        </div>
      </div>

      {/* Sector / Area Statistics Breakdown Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
              <span>Thống Kê Chất Lượng Theo Khu Vực Kiểm Tra</span>
            </h2>
            <p className="text-xs text-slate-500">
              Theo dõi chỉ số đạt chuẩn & tổng số phòng / khu vực thuộc Bếp, Nhà hàng, Nhà vệ sinh & Công cộng
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Sector 1: Bedrooms */}
          <div 
            onClick={() => setSelectedSectorModal(bedroomStats)}
            className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 transition space-y-2.5 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                <BedDouble className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                {bedroomStats.avg}%
              </span>
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition">Phòng Ngủ Khách</h3>
              <p className="text-[11px] text-slate-500">{bedroomStats.count} phòng • Bed & Living</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSectorModal(bedroomStats);
              }}
              className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-blue-700 rounded-lg text-xs font-bold transition shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Chi Tiết</span>
            </button>
          </div>

          {/* Sector 2: Kitchen */}
          <div 
            onClick={() => setSelectedSectorModal(kitchenStats)}
            className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 transition space-y-2.5 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition">
                <ChefHat className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                {kitchenStats.avg}%
              </span>
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-rose-600 transition">Khu Vực Bếp</h3>
              <p className="text-[11px] text-slate-500">{kitchenStats.count || 1} khu vực • Kitchen & Food Safety</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSectorModal(kitchenStats);
              }}
              className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-white hover:bg-rose-600 hover:text-white border border-rose-200 text-rose-700 rounded-lg text-xs font-bold transition shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Chi Tiết</span>
            </button>
          </div>

          {/* Sector 3: Restaurant */}
          <div 
            onClick={() => setSelectedSectorModal(restaurantStats)}
            className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 transition space-y-2.5 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                {restaurantStats.avg}%
              </span>
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-amber-600 transition">Nhà Hàng</h3>
              <p className="text-[11px] text-slate-500">{restaurantStats.count || 1} khu vực • Buffet & Dining</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSectorModal(restaurantStats);
              }}
              className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-white hover:bg-amber-600 hover:text-white border border-amber-200 text-amber-700 rounded-lg text-xs font-bold transition shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Chi Tiết</span>
            </button>
          </div>

          {/* Sector 4: Restrooms */}
          <div 
            onClick={() => setSelectedSectorModal(restroomStats)}
            className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 transition space-y-2.5 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition">
                <Bath className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                {restroomStats.avg}%
              </span>
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-600 transition">Nhà Vệ Sinh</h3>
              <p className="text-[11px] text-slate-500">{restroomStats.count || 1} khu vực • Restroom Standard</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSectorModal(restroomStats);
              }}
              className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-white hover:bg-emerald-600 hover:text-white border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold transition shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Chi Tiết</span>
            </button>
          </div>

          {/* Sector 5: Public Areas */}
          <div 
            onClick={() => setSelectedSectorModal(publicAreaStats)}
            className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 transition space-y-2.5 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                {publicAreaStats.avg}%
              </span>
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600 transition">Khu Vực Công Cộng</h3>
              <p className="text-[11px] text-slate-500">{publicAreaStats.count || 1} khu vực • Lobby & Hallways</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSectorModal(publicAreaStats);
              }}
              className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold transition shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Chi Tiết</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Line Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Xu Hướng Chất Lượng Dịch Vụ Theo Thời Gian</h2>
              <p className="text-xs text-slate-500">Tỷ lệ đạt chuẩn trung bình qua các ngày kiểm tra</p>
            </div>
            <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>+4.2% so với tuần trước</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} 
                  formatter={(val: any) => [`${val}% Điểm Đạt`, 'Chất Lượng']}
                />
                <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Defect Category Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Phân Loại Sự Cố Thường Gặp</h2>
            <p className="text-xs text-slate-500">Tỷ lệ hạng mục cần bảo trì theo bộ phận</p>

            <div className="h-44 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDefectsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryDefectsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {categoryDefectsData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-700 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Inspection Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Nhật Ký Kiểm Tra Gần Đây</h2>
            <p className="text-xs text-slate-500">Danh sách báo cáo phòng đã thực hiện và trạng thái đồng bộ Google Drive</p>
          </div>

          <button
            onClick={() => onStartInspection()}
            className="flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thực Hiện Kiểm Tra</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Mã Báo Cáo</th>
                <th className="py-3 px-4">Phòng / Khu Vực</th>
                <th className="py-3 px-4">Thanh Tra Viên</th>
                <th className="py-3 px-4">Thời Gian</th>
                <th className="py-3 px-4 text-center">Điểm Số</th>
                <th className="py-3 px-4 text-center">Xếp Loại</th>
                <th className="py-3 px-4 text-center">Google Drive</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {reports.map((report) => {
                let badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (report.overallScore < 80) badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
                else if (report.overallScore < 90) badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">{report.reportCode}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{report.roomNumber}</div>
                      <div className="text-[11px] text-slate-400">{report.roomType}</div>
                    </td>
                    <td className="py-3 px-4 font-medium">{report.inspectorName}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(report.inspectionDate).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-extrabold text-slate-900 text-sm">{report.overallScore}%</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${badgeStyle}`}>
                        {report.qualityGrade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {report.driveSyncedAt || report.driveFileId ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-200">
                          <Cloud className="w-3 h-3" />
                          <span>Đã lưu Drive</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-slate-400 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                          <Clock className="w-3 h-3" />
                          <span>Chưa đồng bộ</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onViewReport(report)}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem Báo Cáo</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sector Detail Modal */}
      {selectedSectorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl ${selectedSectorModal.bgClass} ${selectedSectorModal.colorClass}`}>
                  {selectedSectorModal.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span>{selectedSectorModal.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {selectedSectorModal.subtitle}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Chi tiết tình trạng chất lượng, danh sách phòng và nhật ký kiểm tra gần đây
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSectorModal(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
              {/* Stat Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Điểm Chất Lượng</span>
                  <div className="mt-1 flex items-baseline space-x-1.5">
                    <span className="text-2xl font-extrabold text-slate-900">{selectedSectorModal.avg}%</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Đạt Chuẩn</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng Khu Vực</span>
                  <div className="mt-1 text-2xl font-extrabold text-slate-900">
                    {selectedSectorModal.count} <span className="text-xs font-normal text-slate-500">phòng/khu</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cần Bảo Trì</span>
                  <div className="mt-1 text-2xl font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>{selectedSectorModal.needsMaintenance}</span>
                    {selectedSectorModal.needsMaintenance > 0 && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Chú Ý</span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Báo Cáo Đã Lưu</span>
                  <div className="mt-1 text-2xl font-extrabold text-slate-900">
                    {selectedSectorModal.reports.length} <span className="text-xs font-normal text-slate-500">lượt</span>
                  </div>
                </div>
              </div>

              {/* Section 1: Room / Area Directory Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Danh Sách Phòng & Khu Vực Chức Năng</span>
                  </h3>
                  <span className="text-xs text-slate-500">Có {selectedSectorModal.rooms.length} mục trực thuộc</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                        <th className="py-2.5 px-3">Tên / Mã Khu Vực</th>
                        <th className="py-2.5 px-3">Tầng</th>
                        <th className="py-2.5 px-3">Trạng Thái</th>
                        <th className="py-2.5 px-3 text-center">Điểm Cuối</th>
                        <th className="py-2.5 px-3">Nhân Viên Dọn</th>
                        <th className="py-2.5 px-3 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedSectorModal.rooms.length > 0 ? (
                        selectedSectorModal.rooms.map((room) => (
                          <tr key={room.id} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-3 font-bold text-slate-900">{room.roomNumber}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-600">Tầng {room.floor || 1}</td>
                            <td className="py-2.5 px-3">
                              {room.status === 'READY' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  🟢 Sẵn Sàng
                                </span>
                              )}
                              {room.status === 'NEEDS_MAINTENANCE' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                  🔴 Cần Sửa Chữa
                                </span>
                              )}
                              {room.status === 'INSPECTING' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                                  🔵 Đang Kiểm Tra
                                </span>
                              )}
                              {room.status === 'CLEANING' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                  🟡 Đang Dọn
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-extrabold text-slate-900">
                              {room.lastScore !== undefined ? `${room.lastScore}%` : '---'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{room.housekeeperName || 'Chưa phân công'}</td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => {
                                  setSelectedSectorModal(null);
                                  onStartInspection(room.id);
                                }}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-lg text-xs font-bold transition"
                              >
                                Kiểm Tra Ngay
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                            Chưa có danh sách phòng riêng lẻ. Nhấn Kiểm Tra bên dưới để chọn mẫu mặc định.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: Recent Inspection Reports */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                    <span>Lịch Sử Kiểm Tra Gần Đây</span>
                  </h3>
                  <span className="text-xs text-slate-500">{selectedSectorModal.reports.length} báo cáo</span>
                </div>

                {selectedSectorModal.reports.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedSectorModal.reports.map((report) => (
                      <div key={report.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-slate-900">{report.reportCode}</span>
                            <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                              {report.roomNumber}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {new Date(report.inspectionDate).toLocaleDateString('vi-VN')} • {report.inspectorName}
                          </p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-sm font-extrabold text-slate-900">{report.overallScore}%</div>
                            <div className="text-[10px] font-bold text-emerald-600">{report.qualityGrade}</div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedSectorModal(null);
                              onViewReport(report);
                            }}
                            className="p-2 bg-white hover:bg-blue-50 text-blue-600 rounded-lg border border-slate-200 transition"
                            title="Xem Báo Cáo"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                    Chưa có nhật ký kiểm tra cho khu vực này.
                  </div>
                )}
              </div>

              {/* Section 3: Active Maintenance Tickets */}
              {selectedSectorModal.tickets.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-600" />
                      <span>Sự Cố & Phiếu Bảo Trì Đang Xử Lý</span>
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedSectorModal(null);
                        onGoToMaintenance();
                      }}
                      className="text-xs text-blue-600 hover:underline font-bold"
                    >
                      Xem tất cả phiếu bảo trì →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {selectedSectorModal.tickets.map((ticket) => (
                      <div key={ticket.id} className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-amber-900">{ticket.ticketCode}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                              {ticket.severity}
                            </span>
                            <span className="text-xs font-semibold text-slate-800">{ticket.roomNumber} - {ticket.itemTitle}</span>
                          </div>
                          <p className="text-xs text-slate-600">{ticket.description}</p>
                        </div>

                        <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded-lg shrink-0">
                          {ticket.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setSelectedSectorModal(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition"
              >
                Đóng
              </button>

              <button
                onClick={() => {
                  const targetRoomId = selectedSectorModal.rooms[0]?.id;
                  setSelectedSectorModal(null);
                  onStartInspection(targetRoomId);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Thực Hiện Kiểm Tra Khu Vực Này</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
