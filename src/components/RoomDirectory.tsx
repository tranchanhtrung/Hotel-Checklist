import React, { useState } from 'react';
import { 
  BedDouble, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ClipboardCheck, 
  Plus, 
  Search,
  ChefHat,
  UtensilsCrossed,
  Bath,
  Building2,
  Filter,
  Pencil,
  Trash2
} from 'lucide-react';
import { HotelRoom, RoomStatus } from '../types';

interface RoomDirectoryProps {
  rooms: HotelRoom[];
  onStartInspection: (roomId: string) => void;
  onAddRoom: (newRoom: HotelRoom) => void;
  onUpdateRoom: (updatedRoom: HotelRoom) => void;
  onDeleteRoom: (roomId: string) => void;
}

export const RoomDirectory: React.FC<RoomDirectoryProps> = ({
  rooms,
  onStartInspection,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<HotelRoom | null>(null);

  // New Room Form
  const [newRoomNum, setNewRoomNum] = useState<string>('');
  const [newFloor, setNewFloor] = useState<number>(1);
  const [newType, setNewType] = useState<any>('DELUXE');
  const [newHousekeeper, setNewHousekeeper] = useState<string>('');

  // Edit Room Form
  const [editRoomNum, setEditRoomNum] = useState<string>('');
  const [editFloor, setEditFloor] = useState<number>(1);
  const [editType, setEditType] = useState<any>('DELUXE');
  const [editStatus, setEditStatus] = useState<RoomStatus>('READY');
  const [editHousekeeper, setEditHousekeeper] = useState<string>('');

  const filteredRooms = rooms.filter((r) => {
    if (searchQuery && !r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (filterType !== 'ALL') {
      if (filterType === 'BEDROOMS') return ['STANDARD', 'DELUXE', 'SUITE', 'PRESIDENTIAL'].includes(r.type);
      if (r.type !== filterType) return false;
    }
    return true;
  });

  const getAreaIcon = (type: string) => {
    switch (type) {
      case 'KITCHEN':
        return <ChefHat className="w-5 h-5 text-rose-600" />;
      case 'RESTAURANT':
        return <UtensilsCrossed className="w-5 h-5 text-amber-600" />;
      case 'RESTROOM':
        return <Bath className="w-5 h-5 text-emerald-600" />;
      case 'PUBLIC_AREA':
        return <Building2 className="w-5 h-5 text-indigo-600" />;
      default:
        return <BedDouble className="w-5 h-5 text-blue-600" />;
    }
  };

  const getAreaTypeLabel = (type: string) => {
    switch (type) {
      case 'KITCHEN':
        return 'Khu Vực Bếp';
      case 'RESTAURANT':
        return 'Nhà Hàng';
      case 'RESTROOM':
        return 'Nhà Vệ Sinh';
      case 'PUBLIC_AREA':
        return 'Khu Công Cộng';
      default:
        return type;
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNum) return;

    const created: HotelRoom = {
      id: `room-${Date.now()}`,
      roomNumber: newRoomNum.startsWith('Phòng') || newRoomNum.startsWith('Khu') || newRoomNum.startsWith('Nhà') ? newRoomNum : `Phòng ${newRoomNum}`,
      floor: Number(newFloor),
      type: newType,
      status: 'READY',
      housekeeperName: newHousekeeper || 'Chưa phân công',
    };

    onAddRoom(created);
    setShowAddModal(false);
    setNewRoomNum('');
    setNewHousekeeper('');
  };

  const openEditModal = (room: HotelRoom) => {
    setEditingRoom(room);
    setEditRoomNum(room.roomNumber);
    setEditFloor(room.floor);
    setEditType(room.type);
    setEditStatus(room.status);
    setEditHousekeeper(room.housekeeperName || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    const updated: HotelRoom = {
      ...editingRoom,
      roomNumber: editRoomNum,
      floor: Number(editFloor),
      type: editType,
      status: editStatus,
      housekeeperName: editHousekeeper || 'Chưa phân công',
    };

    onUpdateRoom(updated);
    setEditingRoom(null);
  };

  const handleDelete = (room: HotelRoom) => {
    if (window.confirm(`Xác nhận xóa khu vực/phòng: "${room.roomNumber}"?`)) {
      onDeleteRoom(room.id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Danh Sách Phòng & Khu Vực Khách Sạn</h1>
          <p className="text-xs text-slate-500">Thêm, sửa, xóa phòng/khu vực và kích hoạt kiểm tra chất lượng</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm số phòng/khu vực..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-slate-50"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Khu Vực</span>
          </button>
        </div>
      </div>

      {/* Area / Sector Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tất Cả Khu Vực ({rooms.length})
        </button>
        <button
          onClick={() => setFilterType('BEDROOMS')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterType === 'BEDROOMS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BedDouble className="w-3.5 h-3.5" /> Phòng Ngủ Khách
        </button>
        <button
          onClick={() => setFilterType('KITCHEN')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterType === 'KITCHEN'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ChefHat className="w-3.5 h-3.5" /> Bếp (Kitchen)
        </button>
        <button
          onClick={() => setFilterType('RESTAURANT')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterType === 'RESTAURANT'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" /> Nhà Hàng
        </button>
        <button
          onClick={() => setFilterType('RESTROOM')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterType === 'RESTROOM'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Bath className="w-3.5 h-3.5" /> Nhà Vệ Sinh
        </button>
        <button
          onClick={() => setFilterType('PUBLIC_AREA')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterType === 'PUBLIC_AREA'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> Khu Công Cộng
        </button>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          let stColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          let stLabel = 'Sẵn Sàng';

          if (room.status === 'INSPECTING') {
            stColor = 'bg-blue-50 text-blue-700 border-blue-200';
            stLabel = 'Đang Kiểm Tra';
          } else if (room.status === 'NEEDS_MAINTENANCE') {
            stColor = 'bg-rose-50 text-rose-700 border-rose-200';
            stLabel = 'Cần Bảo Trì';
          } else if (room.status === 'CLEANING') {
            stColor = 'bg-amber-50 text-amber-700 border-amber-200';
            stLabel = 'Đang Dọn';
          }

          return (
            <div
              key={room.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 relative group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                    {getAreaIcon(room.type)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{room.roomNumber}</h3>
                    <p className="text-[11px] text-slate-400">Tầng {room.floor} • {getAreaTypeLabel(room.type)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${stColor}`}>
                    {stLabel}
                  </span>
                  
                  {/* Action Buttons: Edit & Delete */}
                  <button
                    onClick={() => openEditModal(room)}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Chỉnh sửa khu vực"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(room)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Xóa khu vực"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Nhân viên phụ trách:</span>
                  <strong className="text-slate-800">{room.housekeeperName || 'Chưa giao'}</strong>
                </div>
                {room.lastScore !== undefined && (
                  <div className="flex justify-between">
                    <span>Điểm gần nhất:</span>
                    <strong className="text-blue-600 font-extrabold">{room.lastScore}%</strong>
                  </div>
                )}
              </div>

              <button
                onClick={() => onStartInspection(room.id)}
                className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition shadow-sm"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Kiểm Tra Khu Vực Này</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateRoom} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Thêm Khu Vực / Phòng Mới</h2>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Số Phòng / Tên Khu Vực *</label>
              <input
                type="text"
                required
                value={newRoomNum}
                onChange={(e) => setNewRoomNum(e.target.value)}
                placeholder="VD: Phòng 401, Khu Bếp Bánh, Nhà Hàng Ý..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nhân Viên Phụ Trách / Buồng Phòng</label>
              <input
                type="text"
                value={newHousekeeper}
                onChange={(e) => setNewHousekeeper(e.target.value)}
                placeholder="VD: Nguyễn Văn A..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tầng</label>
                <input
                  type="number"
                  value={newFloor}
                  onChange={(e) => setNewFloor(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Loại Khu Vực</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-slate-50"
                >
                  <option value="STANDARD">Phòng Standard</option>
                  <option value="DELUXE">Phòng Deluxe</option>
                  <option value="SUITE">Phòng Suite VIP</option>
                  <option value="PRESIDENTIAL">Phòng Tổng Thống</option>
                  <option value="KITCHEN">Khu Vực Bếp (Kitchen)</option>
                  <option value="RESTAURANT">Nhà Hàng (Restaurant)</option>
                  <option value="RESTROOM">Nhà Vệ Sinh (Restroom)</option>
                  <option value="PUBLIC_AREA">Khu Vực Công Cộng</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 shadow-sm"
              >
                Tạo Mới
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Room Modal */}
      {editingRoom && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Chỉnh Sửa Thông Tin Khu Vực / Phòng</h2>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên / Số Phòng *</label>
              <input
                type="text"
                required
                value={editRoomNum}
                onChange={(e) => setEditRoomNum(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-slate-50 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nhân Viên Phụ Trách</label>
              <input
                type="text"
                value={editHousekeeper}
                onChange={(e) => setEditHousekeeper(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tầng</label>
                <input
                  type="number"
                  value={editFloor}
                  onChange={(e) => setEditFloor(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Loại Khu Vực</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-slate-50"
                >
                  <option value="STANDARD">Phòng Standard</option>
                  <option value="DELUXE">Phòng Deluxe</option>
                  <option value="SUITE">Phòng Suite VIP</option>
                  <option value="PRESIDENTIAL">Phòng Tổng Thống</option>
                  <option value="KITCHEN">Khu Vực Bếp (Kitchen)</option>
                  <option value="RESTAURANT">Nhà Hàng (Restaurant)</option>
                  <option value="RESTROOM">Nhà Vệ Sinh (Restroom)</option>
                  <option value="PUBLIC_AREA">Khu Vực Công Cộng</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Trạng Thái Thực Tế</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as RoomStatus)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-slate-50 font-semibold"
              >
                <option value="READY">Sẵn Sàng (Ready)</option>
                <option value="INSPECTING">Đang Kiểm Tra (Inspecting)</option>
                <option value="NEEDS_MAINTENANCE">Cần Bảo Trì (Needs Maintenance)</option>
                <option value="CLEANING">Đang Dọn Vệ Sinh (Cleaning)</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 shadow-sm"
              >
                Cập Nhật
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

