import React from 'react';
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
  Building2
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

  // Sector stats calculation
  const getSectorStats = (types: string[]) => {
    const sectorRooms = rooms.filter((r) => types.includes(r.type));
    const count = sectorRooms.length;
    const scores = sectorRooms.map((r) => r.lastScore).filter((s): s is number => s !== undefined);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 95;
    const needsMaintenance = sectorRooms.filter((r) => r.status === 'NEEDS_MAINTENANCE').length;
    return { count, avg, needsMaintenance, room: sectorRooms[0] };
  };

  const bedroomStats = getSectorStats(['STANDARD', 'DELUXE', 'SUITE', 'PRESIDENTIAL']);
  const kitchenStats = getSectorStats(['KITCHEN']);
  const restaurantStats = getSectorStats(['RESTAURANT']);
  const restroomStats = getSectorStats(['RESTROOM']);
  const publicAreaStats = getSectorStats(['PUBLIC_AREA']);

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

            <button
              id="dash-sync-drive-btn"
              onClick={onSyncAllDrive}
              disabled={isSyncingDrive}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition"
            >
              <Cloud className={`w-4 h-4 text-emerald-400 ${isSyncingDrive ? 'animate-bounce' : ''}`} />
              <span>{isSyncingDrive ? 'Đang Lưu Drive...' : 'Đồng Bộ Drive'}</span>
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
          <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 transition space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <BedDouble className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                {bedroomStats.avg}%
              </span>
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Phòng Ngủ Khách</h3>
              <p className="text-[11px] text-slate-500">{bedroomStats.count} phòng • Bed & Living</p>
            </div>
            <button
              onClick={() => onStartInspection(bedroomStats.room?.id)}
              className="w-full text-center py-1.5 bg-white hover:bg-blue-600 hover:text-white border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 transition shadow-2xs"
            >
              + Kiểm Tra
            </button>
          </div>

          {/* Sector 2: Kitchen */}
          <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 transition space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                <ChefHat className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                {kitchenStats.avg}%
              </span>
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Khu Vực Bếp</h3>
              <p className="text-[11px] text-slate-500">{kitchenStats.count || 1} khu vực • Kitchen & Food Safety</p>
            </div>
            <button
              onClick={() => onStartInspection(kitchenStats.room?.id || 'area-kitchen')}
              className="w-full text-center py-1.5 bg-white hover:bg-rose-600 hover:text-white border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 transition shadow-2xs"
            >
              + Kiểm Tra Bếp
            </button>
          </div>

          {/* Sector 3: Restaurant */}
          <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 transition space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                {restaurantStats.avg}%
              </span>
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Nhà Hàng</h3>
              <p className="text-[11px] text-slate-500">{restaurantStats.count || 1} khu vực • Buffet & Dining</p>
            </div>
            <button
              onClick={() => onStartInspection(restaurantStats.room?.id || 'area-restaurant')}
              className="w-full text-center py-1.5 bg-white hover:bg-amber-600 hover:text-white border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 transition shadow-2xs"
            >
              + Kiểm Tra Nhà Hàng
            </button>
          </div>

          {/* Sector 4: Restrooms */}
          <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 transition space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <Bath className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                {restroomStats.avg}%
              </span>
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Nhà Vệ Sinh</h3>
              <p className="text-[11px] text-slate-500">{restroomStats.count || 1} khu vực • Restroom Standard</p>
            </div>
            <button
              onClick={() => onStartInspection(restroomStats.room?.id || 'area-restroom')}
              className="w-full text-center py-1.5 bg-white hover:bg-emerald-600 hover:text-white border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 transition shadow-2xs"
            >
              + Kiểm Tra Vệ Sinh
            </button>
          </div>

          {/* Sector 5: Public Areas */}
          <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 transition space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                {publicAreaStats.avg}%
              </span>
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Khu Vực Công Cộng</h3>
              <p className="text-[11px] text-slate-500">{publicAreaStats.count || 1} khu vực • Lobby & Hallways</p>
            </div>
            <button
              onClick={() => onStartInspection(publicAreaStats.room?.id || 'area-lobby')}
              className="w-full text-center py-1.5 bg-white hover:bg-indigo-600 hover:text-white border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 transition shadow-2xs"
            >
              + Kiểm Tra Công Cộng
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
    </div>
  );
};
