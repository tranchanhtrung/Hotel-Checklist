import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  FileJson, 
  CheckCircle2, 
  ListTodo, 
  Layers, 
  Sparkles,
  Download,
  Upload
} from 'lucide-react';
import { ChecklistCategory, ChecklistItem, ChecklistTemplate, RoomType } from '../types';

interface ChecklistBuilderProps {
  templates: ChecklistTemplate[];
  onSaveTemplate: (newTemplate: ChecklistTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
}

export const ChecklistBuilder: React.FC<ChecklistBuilderProps> = ({
  templates,
  onSaveTemplate,
  onDeleteTemplate,
}) => {
  const [activeTemplateId, setActiveTemplateId] = useState<string>(templates[0]?.id || '');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Form state when editing/creating template
  const [templateName, setTemplateName] = useState<string>('');
  const [templateDesc, setTemplateDesc] = useState<string>('');
  const [hotelRating, setHotelRating] = useState<'3_STAR' | '4_STAR' | '5_STAR' | 'CUSTOM'>('5_STAR');
  const [targetRoomType, setTargetRoomType] = useState<RoomType | 'ALL'>('ALL');
  const [categories, setCategories] = useState<ChecklistCategory[]>([]);

  const selectedTemplate = templates.find((t) => t.id === activeTemplateId) || templates[0];

  const handleStartCreateNew = () => {
    setEditingTemplateId(null); // Creating new template
    setTemplateName(`Mẫu Checklist Mới (${templates.length + 1})`);
    setTemplateDesc('Mô tả quy chuẩn kiểm tra chất lượng phòng.');
    setHotelRating('5_STAR');
    setTargetRoomType('ALL');
    setCategories([
      {
        id: `cat-${Date.now()}`,
        title: 'Danh Mục Kiểm Tra 1',
        items: [
          {
            id: `item-${Date.now()}`,
            code: 'ITEM-01',
            title: 'Tiêu chuẩn kiểm tra 1',
            standardRequirement: 'Sạch bóng, không trầy xước, hoạt động hoàn hảo 100%.',
            weight: 5,
          },
        ],
      },
    ]);
    setIsEditing(true);
  };

  const handleStartEditCurrent = () => {
    if (!selectedTemplate) return;
    setEditingTemplateId(selectedTemplate.id);
    setTemplateName(selectedTemplate.name);
    setTemplateDesc(selectedTemplate.description);
    setHotelRating(selectedTemplate.hotelRating);
    setTargetRoomType(selectedTemplate.targetRoomType);
    setCategories(JSON.parse(JSON.stringify(selectedTemplate.categories)));
    setIsEditing(true);
  };

  const handleAddCategory = () => {
    setCategories((prev) => [
      ...prev,
      {
        id: `cat-${Date.now()}`,
        title: `Danh Mục Mới ${prev.length + 1}`,
        items: [],
      },
    ]);
  };

  const handleAddItemToCat = (catId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== catId) return cat;
        const newCode = `ITEM-0${cat.items.length + 1}`;
        return {
          ...cat,
          items: [
            ...cat.items,
            {
              id: `item-${Date.now()}`,
              code: newCode,
              title: 'Hạng mục kiểm tra mới',
              standardRequirement: 'Mô tả chi tiết tiêu chuẩn quy định.',
              weight: 4,
            },
          ],
        };
      })
    );
  };

  const handleSave = () => {
    if (!templateName.trim()) return;

    const savedTpl: ChecklistTemplate = {
      id: editingTemplateId || `tpl-custom-${Date.now()}`,
      name: templateName,
      description: templateDesc,
      hotelRating,
      targetRoomType,
      categories,
      createdAt: new Date().toISOString(),
    };

    onSaveTemplate(savedTpl);
    setActiveTemplateId(savedTpl.id);
    setIsEditing(false);
    setEditingTemplateId(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTemplateId(null);
  };

  // Export JSON
  const handleExportJson = () => {
    if (!selectedTemplate) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedTemplate, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${selectedTemplate.name.replace(/\s+/g, '_')}_Checklist.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản Lý Mẫu Checklist Linh Hoạt</h1>
          <p className="text-xs text-slate-500">Tạo, tùy chỉnh tiêu chuẩn đánh giá chất lượng phòng và xuất/nhập file JSON</p>
        </div>

        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <>
              <button
                onClick={handleExportJson}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                <Download className="w-4 h-4" />
                <span>Xuất JSON</span>
              </button>

              <button
                id="create-new-template-btn"
                onClick={handleStartCreateNew}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo Mẫu Mới</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Hủy
              </button>

              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingTemplateId ? 'Lưu Thay Đổi' : 'Lưu Mẫu Mới'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {!isEditing ? (
        /* View Mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template List Side Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">Danh Sách Mẫu Hiện Có</h2>
            <div className="space-y-2">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setActiveTemplateId(tpl.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    activeTemplateId === tpl.id
                      ? 'border-blue-500 bg-blue-50/60 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{tpl.name}</h3>
                    <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded shrink-0">
                      {tpl.targetRoomType === 'KITCHEN' ? '🍳 Bếp' :
                       tpl.targetRoomType === 'RESTAURANT' ? '🍽️ Nhà Hàng' :
                       tpl.targetRoomType === 'RESTROOM' ? '🚽 Vệ Sinh' :
                       tpl.targetRoomType === 'PUBLIC_AREA' ? '🏛️ Sảnh' :
                       tpl.targetRoomType === 'STANDARD' ? '🛏️ Phòng Ngủ' : '🌐 Tất Cả'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{tpl.description}</p>
                  <div className="mt-2 text-[11px] font-medium text-slate-400 flex items-center justify-between">
                    <span>{tpl.categories.length} danh mục</span>
                    <span>{tpl.categories.reduce((acc, c) => acc + c.items.length, 0)} tiêu chuẩn</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Template Details */}
          {selectedTemplate && (
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedTemplate.name}</h2>
                  <p className="text-xs text-slate-500">{selectedTemplate.description}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleStartEditCurrent}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Chỉnh Sửa Mẫu</span>
                  </button>

                  {templates.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc chắn muốn xóa mẫu "${selectedTemplate.name}"?`)) {
                          onDeleteTemplate(selectedTemplate.id);
                          const remaining = templates.filter((t) => t.id !== selectedTemplate.id);
                          if (remaining.length > 0) {
                            setActiveTemplateId(remaining[0].id);
                          }
                        }
                      }}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition"
                      title="Xóa mẫu này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Categories & Items Listing */}
              <div className="space-y-6">
                {selectedTemplate.categories.map((cat) => (
                  <div key={cat.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-200 flex items-center justify-between">
                      <span>{cat.title}</span>
                      <span className="text-slate-400 font-normal">{cat.items.length} hạng mục</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {cat.items.map((item) => (
                        <div key={item.id} className="p-3.5 hover:bg-slate-50/50 transition">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-[11px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              {item.code}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium ml-auto">
                              Trọng số: {item.weight}/5
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{item.standardRequirement}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Edit / Create Form Mode */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-100 pb-5">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Khu Vực Áp Dụng Cho Mẫu *</label>
              <select
                value={targetRoomType}
                onChange={(e) => setTargetRoomType(e.target.value as RoomType | 'ALL')}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:ring-2 focus:ring-blue-500"
              >
                <option value="STANDARD">🛏️ Phòng Ngủ & Căn Hộ Khách Sạn</option>
                <option value="KITCHEN">🍳 Khu Vực Bếp & An Toàn Thực Phẩm</option>
                <option value="RESTAURANT">🍽️ Nhà Hàng & Phục Vụ F&B</option>
                <option value="RESTROOM">🚽 Nhà Vệ Sinh Công Cộng</option>
                <option value="PUBLIC_AREA">🏛️ Sảnh & Khu Vực Công Cộng</option>
                <option value="ALL">🌐 Áp Dụng Chung Tất Cả Khu Vực</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên Mẫu Checklist *</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50"
                placeholder="VD: Checklist Chuyên Khu Vực Bếp"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mô Tả Bộ Tiêu Chuẩn</label>
              <input
                type="text"
                value={templateDesc}
                onChange={(e) => setTemplateDesc(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-slate-50"
                placeholder="Mô tả mục đích kiểm tra..."
              />
            </div>
          </div>

          {/* Dynamic Categories Builder */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Mẫu Tiêu Chuẩn Theo Khu Vực</h3>
                <p className="text-[11px] text-slate-500">Nhấn chọn khu vực để khởi tạo nhanh danh mục tiêu chuẩn chuyên biệt:</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTargetRoomType('STANDARD');
                    setTemplateName('Checklist Chuyên Phòng Ngủ & Căn Hộ Khách Sạn');
                    setTemplateDesc('Quy chuẩn kiểm tra phòng ngủ, ga giường, chiếu sáng, điều hòa & tiện nghi phòng tắm.');
                    setCategories([
                      {
                        id: `cat-bed-1-${Date.now()}`,
                        title: 'Phòng Ngủ & Không Gian Khách',
                        items: [
                          { id: `i-b1-${Date.now()}`, code: 'BED-01', title: 'Giường nệm, Ga giường & Vỏ gối', standardRequirement: 'Ga giường phẳng đét, không nếp nhăn, không vết bẩn. Vỏ gối thơm sạch.', weight: 5 },
                          { id: `i-b2-${Date.now()}`, code: 'BED-02', title: 'Hệ thống điện, Đèn & Điều hòa', standardRequirement: 'Đèn ngủ, TV, điều hòa 24°C hoạt động hoàn hảo, remote sạch sẽ.', weight: 4 },
                        ],
                      },
                      {
                        id: `cat-bed-2-${Date.now()}`,
                        title: 'Phòng Tắm & Tiện Nghi Vệ Sinh',
                        items: [
                          { id: `i-b3-${Date.now()}`, code: 'BTH-01', title: 'Bồn cầu & Vách kính phòng tắm', standardRequirement: 'Tẩy rửa sát khuẩn 100%, vách kính trong suốt không vệt nước.', weight: 5 },
                          { id: `i-b4-${Date.now()}`, code: 'BTH-02', title: 'Khăn tắm, Khăn mặt & Bộ Amenities', standardRequirement: 'Khăn trắng tinh khiết, gấp góc chuẩn 45 độ. Bộ bàn chải, xà bông đầy đủ.', weight: 4 },
                        ],
                      },
                    ]);
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                >
                  <span>🛏️ Phòng Ngủ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTargetRoomType('KITCHEN');
                    setTemplateName('Checklist Chuyên Khu Vực Bếp & An Toàn Thực Phẩm');
                    setTemplateDesc('Quy chuẩn kiểm tra nhiệt độ tủ đông/mát, thiết bị bếp, máy hút mùi, bẫy mỡ & tiêu chuẩn HACCP.');
                    setCategories([
                      {
                        id: `cat-kit-1-${Date.now()}`,
                        title: 'Bảo Quản Thực Phẩm & Tủ Đông/Mát',
                        items: [
                          { id: `i-k1-${Date.now()}`, code: 'KIT-01', title: 'Tủ đông, tủ mát & Phân loại thực phẩm', standardRequirement: 'Nhiệt độ tủ mát < 4°C, tủ đông < -18°C. Phân loại thực phẩm sống/chín, dán tem nhãn ngày nhập rõ ràng.', weight: 5 },
                        ],
                      },
                      {
                        id: `cat-kit-2-${Date.now()}`,
                        title: 'Bếp Gas/Điện, Máy Hút Mùi & Bẫy Mỡ',
                        items: [
                          { id: `i-k2-${Date.now()}`, code: 'KIT-02', title: 'Bếp gas/điện, Máy hút mùi & Bẫy mỡ', standardRequirement: 'Bề mặt sạch dầu mỡ, bẫy mỡ xả định kỳ.', weight: 5 },
                        ],
                      },
                      {
                        id: `cat-kit-3-${Date.now()}`,
                        title: 'Dụng Cụ Chế Biến & Khử Trùng HACCP',
                        items: [
                          { id: `i-k3-${Date.now()}`, code: 'KIT-03', title: 'Dụng cụ chế biến & Bàn sơ chế', standardRequirement: 'Thớt phân màu HACCP, khử trùng dao kéo sau ca làm việc.', weight: 4 },
                        ],
                      },
                    ]);
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                >
                  <span>🍳 Khu Vực Bếp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTargetRoomType('RESTAURANT');
                    setTemplateName('Checklist Chuyên Nhà Hàng & Phục Vụ F&B');
                    setTemplateDesc('Quy chuẩn kiểm tra vệ sinh bàn ghế, khu vực Buffet, quầy bar & không gian nhà hàng.');
                    setCategories([
                      {
                        id: `cat-rst-1-${Date.now()}`,
                        title: 'Vệ Sinh Bàn Ghế & Bộ Dụng Cụ Ăn',
                        items: [
                          { id: `i-r1-${Date.now()}`, code: 'RST-01', title: 'Vệ sinh bàn ghế, Khăn trải bàn & Bộ dụng cụ ăn', standardRequirement: 'Bàn ghế sạch sát khuẩn, dao muỗng nĩa sáng bóng không vệt nước.', weight: 4 },
                        ],
                      },
                      {
                        id: `cat-rst-2-${Date.now()}`,
                        title: 'Khu Vực Buffet & Quầy Bar',
                        items: [
                          { id: `i-r2-${Date.now()}`, code: 'RST-02', title: 'Khu vực Buffet & Quầy Bar', standardRequirement: 'Món ăn giữ nóng > 60°C, mặt kính quầy sạch sẽ, nhãn tên món rõ ràng.', weight: 5 },
                        ],
                      },
                      {
                        id: `cat-rst-3-${Date.now()}`,
                        title: 'Không Gian, Ánh Sáng & Âm Thanh',
                        items: [
                          { id: `i-r3-${Date.now()}`, code: 'RST-03', title: 'Ánh sáng, Âm nhạc & Điều hòa', standardRequirement: 'Nhiệt độ 23°C, nhạc vừa phải, không khí thoáng mát.', weight: 3 },
                        ],
                      },
                    ]);
                  }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                >
                  <span>🍽️ Nhà Hàng</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTargetRoomType('RESTROOM');
                    setTemplateName('Checklist Chuyên Nhà Vệ Sinh Công Cộng');
                    setTemplateDesc('Quy chuẩn kiểm tra bồn cầu, urinal, chậu rửa mặt, xà phòng & khử trùng tự động.');
                    setCategories([
                      {
                        id: `cat-wsr-1-${Date.now()}`,
                        title: 'Bồn Cầu, Urinal & Khử Trùng Tự Động',
                        items: [
                          { id: `i-w1-${Date.now()}`, code: 'WSR-01', title: 'Bồn cầu, Urinal & Hệ thống xả tự động', standardRequirement: 'Tẩy rửa sát khuẩn 100%, không mùi hôi.', weight: 5 },
                        ],
                      },
                      {
                        id: `cat-wsr-2-${Date.now()}`,
                        title: 'Chậu Rửa Mặt, Gương Soi & Xà Phòng',
                        items: [
                          { id: `i-w2-${Date.now()}`, code: 'WSR-02', title: 'Chậu rửa mặt, Gương & Xà phòng rửa tay', standardRequirement: 'Gương sáng bóng, xà phòng rửa tay luôn đầy.', weight: 4 },
                        ],
                      },
                      {
                        id: `cat-wsr-3-${Date.now()}`,
                        title: 'Vệ Sinh Sàn Nhà & Mùi Hương',
                        items: [
                          { id: `i-w3-${Date.now()}`, code: 'WSR-03', title: 'Sàn nhà khô ráo & Mùi hương không gian', standardRequirement: 'Sàn lau khô ráo chống trơn trượt, tinh dầu thơm dịu.', weight: 4 },
                        ],
                      },
                    ]);
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                >
                  <span>🚽 Nhà Vệ Sinh</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTargetRoomType('PUBLIC_AREA');
                    setTemplateName('Checklist Chuyên Khu Vực Công Cộng & Sảnh');
                    setTemplateDesc('Quy chuẩn kiểm tra sảnh lễ tân, ghế chờ Lounge, thang máy, hành lang & cây cảnh.');
                    setCategories([
                      {
                        id: `cat-pub-1-${Date.now()}`,
                        title: 'Sảnh Lễ Tân & Ghế Ngồi Chờ Lounge',
                        items: [
                          { id: `i-p1-${Date.now()}`, code: 'PUB-01', title: 'Sảnh lễ tân & Ghế ngồi chờ Lounge', standardRequirement: 'Sofa không bám bẩn, thảm hút bụi sạch.', weight: 4 },
                        ],
                      },
                      {
                        id: `cat-pub-2-${Date.now()}`,
                        title: 'Thang Máy & Hành Lang Các Tầng',
                        items: [
                          { id: `i-p2-${Date.now()}`, code: 'PUB-02', title: 'Thang máy & Hành lang các tầng', standardRequirement: 'Cabin inox sáng bóng, nút bấm vệ sinh.', weight: 4 },
                        ],
                      },
                    ]);
                  }}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                >
                  <span>🏛️ Sảnh & Công Cộng</span>
                </button>

                <button
                  onClick={handleAddCategory}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm Danh Mục Trống</span>
                </button>
              </div>
            </div>

            {categories.map((cat, catIdx) => (
              <div key={cat.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={cat.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setCategories((prev) =>
                        prev.map((c) => (c.id === cat.id ? { ...c, title: newTitle } : c))
                      );
                    }}
                    className="font-bold text-sm text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300 flex-1"
                  />

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleAddItemToCat(cat.id)}
                      className="flex items-center space-x-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Tiêu Chuẩn</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Xóa danh mục này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3 pl-2 border-l-2 border-blue-400">
                  {cat.items.map((item, itemIdx) => (
                    <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={item.code}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCategories((prev) =>
                              prev.map((c) =>
                                c.id === cat.id
                                  ? {
                                      ...c,
                                      items: c.items.map((i) => (i.id === item.id ? { ...i, code: val } : i)),
                                    }
                                  : c
                              )
                            );
                          }}
                          className="w-20 font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200"
                        />

                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCategories((prev) =>
                              prev.map((c) =>
                                c.id === cat.id
                                  ? {
                                      ...c,
                                      items: c.items.map((i) => (i.id === item.id ? { ...i, title: val } : i)),
                                    }
                                  : c
                              )
                            );
                          }}
                          className="flex-1 font-bold text-xs text-slate-800 border-b border-slate-200 focus:border-blue-500 outline-none"
                          placeholder="Tên tiêu chuẩn..."
                        />

                        <button
                          type="button"
                          onClick={() => {
                            setCategories((prev) =>
                              prev.map((c) =>
                                c.id === cat.id
                                  ? { ...c, items: c.items.filter((i) => i.id !== item.id) }
                                  : c
                              )
                            );
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Xóa tiêu chuẩn này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={item.standardRequirement}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCategories((prev) =>
                            prev.map((c) =>
                              c.id === cat.id
                                ? {
                                    ...c,
                                    items: c.items.map((i) => (i.id === item.id ? { ...i, standardRequirement: val } : i)),
                                  }
                                : c
                            )
                          );
                        }}
                        className="w-full text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200"
                        placeholder="Mô tả tiêu chuẩn quy định..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
