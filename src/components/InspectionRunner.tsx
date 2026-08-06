import React, { useState, useRef } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Wrench, 
  MinusCircle, 
  Camera, 
  Sparkles, 
  Upload, 
  FileText, 
  Send, 
  Cloud, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { ChecklistTemplate, HotelRoom, InspectionItemResult, InspectionReport, ItemStatus, SeverityLevel } from '../types';
import { analyzeDefectWithAI } from '../services/apiService';
import { generateInspectionPDF } from '../services/pdfService';
import { resizeImage } from '../utils/imageUtils';

interface InspectionRunnerProps {
  templates: ChecklistTemplate[];
  rooms: HotelRoom[];
  initialRoomId?: string;
  onCompleteInspection: (newReport: InspectionReport, pdfDataUrl: string) => void;
  onCancel: () => void;
}

export const InspectionRunner: React.FC<InspectionRunnerProps> = ({
  templates,
  rooms,
  initialRoomId,
  onCompleteInspection,
  onCancel,
}) => {
  // Step State: 1 = Setup, 2 = Checklist, 3 = Sign & Review, 4 = Submitting
  const [step, setStep] = useState<number>(1);

  // Setup Form
  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoomId || rooms[0]?.id || '');
  const [inspectorName, setInspectorName] = useState<string>('Trần Chánh Trung');
  const [inspectorRole, setInspectorRole] = useState<string>('Trưởng Bộ Phận QA / Giám Sát');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    const initRoom = rooms.find(r => r.id === (initialRoomId || rooms[0]?.id));
    if (initRoom) {
      if (initRoom.type === 'KITCHEN') {
        const m = templates.find(t => t.targetRoomType === 'KITCHEN' || t.id.includes('kitchen') || t.name.toLowerCase().includes('bếp'));
        if (m) return m.id;
      }
      if (initRoom.type === 'RESTAURANT') {
        const m = templates.find(t => t.targetRoomType === 'RESTAURANT' || t.id.includes('restaurant') || t.name.toLowerCase().includes('nhà hàng'));
        if (m) return m.id;
      }
      if (initRoom.type === 'RESTROOM') {
        const m = templates.find(t => t.targetRoomType === 'RESTROOM' || t.id.includes('restroom') || t.name.toLowerCase().includes('vệ sinh'));
        if (m) return m.id;
      }
      if (initRoom.type === 'PUBLIC_AREA') {
        const m = templates.find(t => t.targetRoomType === 'PUBLIC_AREA' || t.id.includes('public') || t.name.toLowerCase().includes('công cộng'));
        if (m) return m.id;
      }
      if (['STANDARD', 'DELUXE', 'SUITE', 'PRESIDENTIAL'].includes(initRoom.type)) {
        const m = templates.find(t => t.targetRoomType === 'STANDARD' || t.id.includes('bedroom') || t.name.toLowerCase().includes('phòng ngủ'));
        if (m) return m.id;
      }
    }
    return templates[0]?.id || '';
  });

  // Checklist Item State
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];
  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];

  const [itemResults, setItemResults] = useState<Record<string, InspectionItemResult>>({});
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);
  const [aiAnalyzingItemId, setAiAnalyzingItemId] = useState<string | null>(null);

  // Summary Form
  const [summaryNotes, setSummaryNotes] = useState<string>('');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<string | null>(null);

  // Helper to process uploaded or camera captured image with auto-resizing
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    itemId: string,
    categoryId: string,
    itemTitle: string
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPhoto(itemId);
    const current = getItemState(itemId, categoryId, itemTitle);
    const newPhotos: string[] = [...(current.photoUrls || [])];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const scaledBase64 = await resizeImage(file, 1200, 1200, 0.82);
        newPhotos.push(scaledBase64);
      }

      updateItem(itemId, categoryId, itemTitle, { photoUrls: newPhotos });
    } catch (err) {
      console.error('Lỗi xử lý ảnh:', err);
    } finally {
      setIsProcessingPhoto(null);
      e.target.value = '';
    }
  };

  // Helper to get or initialize item state
  const getItemState = (itemId: string, categoryId: string, itemTitle: string): InspectionItemResult => {
    if (itemResults[itemId]) return itemResults[itemId];
    return {
      itemId,
      categoryId,
      title: itemTitle,
      status: 'PASS',
      score: 100,
      notes: '',
      photoUrls: [],
    };
  };

  const updateItem = (itemId: string, categoryId: string, itemTitle: string, updates: Partial<InspectionItemResult>) => {
    const current = getItemState(itemId, categoryId, itemTitle);
    const updated = { ...current, ...updates };

    // Score auto update
    if (updates.status === 'PASS') updated.score = 100;
    else if (updates.status === 'FAIL') updated.score = 0;
    else if (updates.status === 'MAINTENANCE') updated.score = 50;
    else if (updates.status === 'NA') updated.score = 100;

    setItemResults(prev => ({ ...prev, [itemId]: updated }));
  };

  // Gemini AI Analysis Trigger for a specific item
  const handleAiAnalyzeItem = async (itemId: string, categoryId: string, itemTitle: string, standardRequirement: string) => {
    const current = getItemState(itemId, categoryId, itemTitle);
    setAiAnalyzingItemId(itemId);

    try {
      const aiResponse = await analyzeDefectWithAI({
        itemTitle: current.title,
        standardRequirement: standardRequirement,
        notes: current.notes || 'Phát hiện sai lệch tiêu chuẩn kiểm tra.',
        photoBase64: current.photoUrls && current.photoUrls.length > 0 ? current.photoUrls[0] : undefined,
        hotelName: 'Grand Palace Luxury Hotel',
        roomNumber: selectedRoom?.roomNumber,
      });

      updateItem(itemId, categoryId, itemTitle, {
        severity: aiResponse.severity,
        aiRecommendation: aiResponse.recommendedAction,
        notes: current.notes
          ? `${current.notes} | AI Diagnosis: ${aiResponse.aiSummary}`
          : `AI Diagnosis: ${aiResponse.aiSummary}`,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setAiAnalyzingItemId(null);
    }
  };

  // Helper to find matching template for a room/area
  const getMatchingTemplateId = (room: HotelRoom | undefined, tpls: ChecklistTemplate[]) => {
    if (!room) return tpls[0]?.id || '';
    const roomType = room.type;

    // Direct match by targetRoomType
    const exact = tpls.find((t) => t.targetRoomType === roomType);
    if (exact) return exact.id;

    if (roomType === 'KITCHEN') {
      const match = tpls.find((t) => t.id.includes('kitchen') || t.name.toLowerCase().includes('bếp') || t.targetRoomType === 'KITCHEN');
      if (match) return match.id;
    }
    if (roomType === 'RESTAURANT') {
      const match = tpls.find((t) => t.id.includes('restaurant') || t.name.toLowerCase().includes('nhà hàng') || t.targetRoomType === 'RESTAURANT');
      if (match) return match.id;
    }
    if (roomType === 'RESTROOM') {
      const match = tpls.find((t) => t.id.includes('restroom') || t.name.toLowerCase().includes('vệ sinh') || t.targetRoomType === 'RESTROOM');
      if (match) return match.id;
    }
    if (roomType === 'PUBLIC_AREA') {
      const match = tpls.find((t) => t.id.includes('public') || t.name.toLowerCase().includes('công cộng') || t.targetRoomType === 'PUBLIC_AREA');
      if (match) return match.id;
    }
    if (['STANDARD', 'DELUXE', 'SUITE', 'PRESIDENTIAL'].includes(roomType)) {
      const match = tpls.find((t) => t.id.includes('bedroom') || t.name.toLowerCase().includes('phòng ngủ') || t.targetRoomType === 'STANDARD' || t.targetRoomType === 'ALL');
      if (match) return match.id;
    }

    return tpls[0]?.id || '';
  };

  // Auto-switch matching template when room changes
  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
    setActiveCategoryIndex(0);
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (targetRoom) {
      const matchedTplId = getMatchingTemplateId(targetRoom, templates);
      if (matchedTplId) {
        setSelectedTemplateId(matchedTplId);
      }
    }
  };

  // Active Categories derived directly from selected template
  const activeCategories = React.useMemo(() => {
    if (!selectedTemplate) return [];
    return selectedTemplate.categories;
  }, [selectedTemplate]);

  const safeCategoryIndex = activeCategoryIndex < activeCategories.length ? activeCategoryIndex : 0;

  // Calculate Overall Score %
  const calculateOverallScore = () => {
    let totalPossibleWeight = 0;
    let earnedScoreWeight = 0;

    if (!selectedTemplate) return 100;

    activeCategories.forEach((cat) => {
      cat.items.forEach((item) => {
        const res = getItemState(item.id, cat.id, item.title);
        if (res.status !== 'NA') {
          totalPossibleWeight += item.weight;
          earnedScoreWeight += (res.score / 100) * item.weight;
        }
      });
    });

    if (totalPossibleWeight === 0) return 100;
    return Math.round((earnedScoreWeight / totalPossibleWeight) * 100);
  };

  // Grade mapping
  const getQualityGrade = (score: number) => {
    if (score >= 95) return 'XUẤT SẮC';
    if (score >= 85) return 'ĐẠT CHUẨN';
    if (score >= 70) return 'CẦN CẢI THIỆN';
    return 'KHÔNG ĐẠT';
  };

  // Submit & Complete
  const handleSubmitInspection = async () => {
    setIsSubmitting(true);
    const overallScore = calculateOverallScore();
    const qualityGrade = getQualityGrade(overallScore);

    // Build all item results list
    const allResults: InspectionItemResult[] = [];
    activeCategories.forEach((cat) => {
      cat.items.forEach((item) => {
        allResults.push(getItemState(item.id, cat.id, item.title));
      });
    });

    const reportCode = `INS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${selectedRoom?.roomNumber.replace(/[^0-9]/g, '') || '101'}`;

    const newReport: InspectionReport = {
      id: `rep-${Date.now()}`,
      reportCode,
      hotelName: 'Grand Palace Luxury Hotel & Resort',
      roomNumber: selectedRoom?.roomNumber || 'Phòng 101',
      roomType: selectedRoom?.type || 'DELUXE',
      inspectorName: inspectorName || 'Thanh Tra Viên',
      inspectorRole: inspectorRole || 'QA Manager',
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      inspectionDate: new Date().toISOString(),
      overallScore,
      qualityGrade,
      results: allResults,
      summaryNotes,
      aiExecutiveSummary: `Báo cáo đánh giá tổng thể đạt ${overallScore}% (${qualityGrade}). Đã kiểm tra ${allResults.length} hạng mục tiêu chuẩn khách sạn.`,
      status: 'COMPLETED',
    };

    // Generate PDF Data URL
    const pdfDataUrl = generateInspectionPDF(newReport);

    // Pass back to parent App to trigger Drive Upload & Email send asynchronously
    onCompleteInspection(newReport, pdfDataUrl);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header Step Indicator */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Bắt Đầu Kiểm Tra Phòng & Tiêu Chuẩn</h1>
          <p className="text-xs text-slate-500">Quy trình kiểm tra 3 bước với AI chẩn đoán & tạo báo cáo tự động</p>
        </div>

        <div className="flex items-center space-x-2">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === stepNum
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : step > stepNum
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > stepNum ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              {stepNum < 3 && <div className={`w-8 h-1 ${step > stepNum ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: SETUP INSPECTION */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            1. Thông Tin Đối Tượng Kiểm Tra
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Room Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Chọn Phòng / Khu Vực *
              </label>
              <select
                id="select-room-input"
                value={selectedRoomId}
                onChange={(e) => handleRoomChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roomNumber} - Tầng {r.floor} ({r.type})
                  </option>
                ))}
              </select>
              {selectedRoom && (
                <div className="mt-2 text-xs font-semibold text-blue-700 bg-blue-50 p-2.5 rounded-xl border border-blue-200 flex items-center justify-between">
                  <span>🎯 Checklist tự động khớp cho: <strong>{selectedRoom.roomNumber}</strong></span>
                  <span className="font-bold bg-blue-600 text-white px-2 py-0.5 rounded text-[10px]">{activeCategories.length} danh mục</span>
                </div>
              )}
            </div>

            {/* Template Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Chọn Bộ Tiêu Chuẩn (Checklist) *
              </label>
              <select
                id="select-template-input"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.hotelRating.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Inspector Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Họ & Tên Thanh Tra Viên *
              </label>
              <input
                id="inspector-name-input"
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                placeholder="Nhập họ và tên thanh tra viên"
              />
            </div>

            {/* Inspector Role */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Chức Danh / Bộ Phận *
              </label>
              <input
                id="inspector-role-input"
                type="text"
                value={inspectorRole}
                onChange={(e) => setInspectorRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                placeholder="VD: Trưởng Bộ Phận QA / Giám Sát Buồng Phòng"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold transition"
            >
              Hủy
            </button>

            <button
              id="step1-next-btn"
              onClick={() => setStep(2)}
              className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition"
            >
              <span>Bắt Đầu Đánh Giá</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CHECKLIST EXECUTION */}
      {step === 2 && selectedTemplate && (
        <div className="space-y-6">
          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {activeCategories.map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryIndex(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  safeCategoryIndex === idx
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.title} ({cat.items.length})
              </button>
            ))}
          </div>

          {/* Active Category Items List */}
          {activeCategories[safeCategoryIndex] && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {activeCategories[safeCategoryIndex].title}
                </h3>
                <span className="text-xs font-medium text-slate-500">
                  Phòng: <strong className="text-slate-900">{selectedRoom?.roomNumber}</strong>
                </span>
              </div>

              <div className="space-y-6">
                {activeCategories[safeCategoryIndex].items.map((item) => {
                  const catId = activeCategories[safeCategoryIndex].id;
                  const itemState = getItemState(item.id, catId, item.title);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all ${
                        itemState.status === 'FAIL'
                          ? 'border-rose-300 bg-rose-50/40'
                          : itemState.status === 'MAINTENANCE'
                          ? 'border-amber-300 bg-amber-50/40'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-1 max-w-lg">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {item.code}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            <strong className="text-slate-700">Tiêu chuẩn: </strong>
                            {item.standardRequirement}
                          </p>
                        </div>

                        {/* Status Buttons */}
                        <div className="flex items-center space-x-1.5 self-end sm:self-center">
                          {/* PASS */}
                          <button
                            type="button"
                            onClick={() => updateItem(item.id, catId, item.title, { status: 'PASS' })}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              itemState.status === 'PASS'
                                ? 'bg-emerald-600 text-white shadow'
                                : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ĐẠT</span>
                          </button>

                          {/* FAIL */}
                          <button
                            type="button"
                            onClick={() => updateItem(item.id, catId, item.title, { status: 'FAIL' })}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              itemState.status === 'FAIL'
                                ? 'bg-rose-600 text-white shadow'
                                : 'bg-white text-slate-600 hover:bg-rose-50 border border-slate-200'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>LỖI</span>
                          </button>

                          {/* MAINTENANCE */}
                          <button
                            type="button"
                            onClick={() => updateItem(item.id, catId, item.title, { status: 'MAINTENANCE' })}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              itemState.status === 'MAINTENANCE'
                                ? 'bg-amber-600 text-white shadow'
                                : 'bg-white text-slate-600 hover:bg-amber-50 border border-slate-200'
                            }`}
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>SỬA CHỮA</span>
                          </button>

                          {/* N/A */}
                          <button
                            type="button"
                            onClick={() => updateItem(item.id, catId, item.title, { status: 'NA' })}
                            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                              itemState.status === 'NA'
                                ? 'bg-slate-700 text-white'
                                : 'bg-white text-slate-500 border border-slate-200'
                            }`}
                          >
                            <MinusCircle className="w-3.5 h-3.5" />
                            <span>N/A</span>
                          </button>
                        </div>
                      </div>

                      {/* Expanded Defect Details for FAIL or MAINTENANCE */}
                      {(itemState.status === 'FAIL' || itemState.status === 'MAINTENANCE' || itemState.notes) && (
                        <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-3">
                          {/* Inspector Note Input */}
                          <div>
                            <input
                              type="text"
                              value={itemState.notes || ''}
                              onChange={(e) => updateItem(item.id, catId, item.title, { notes: e.target.value })}
                              placeholder="Nhập mô tả sự cố hoặc vị trí hư hỏng cụ thể..."
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                            />
                          </div>

                          {/* Photo Attachment Options */}
                          <div className="flex flex-wrap items-center justify-between gap-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                                <Camera className="w-3.5 h-3.5" /> Hình Ảnh Minh Họa Sự Cố:
                              </span>

                              {/* Camera Direct Capture Input */}
                              <label
                                htmlFor={`camera-capture-${item.id}`}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold cursor-pointer border border-blue-200 transition shadow-sm"
                              >
                                <Camera className="w-3.5 h-3.5 text-blue-600" />
                                <span>Chụp Trực Tiếp</span>
                                <input
                                  id={`camera-capture-${item.id}`}
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  onChange={(e) => handleImageUpload(e, item.id, catId, item.title)}
                                />
                              </label>

                              {/* Gallery File Selection Input */}
                              <label
                                htmlFor={`device-upload-${item.id}`}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer border border-slate-300 transition shadow-sm"
                              >
                                <Upload className="w-3.5 h-3.5 text-slate-600" />
                                <span>Chọn Từ Máy</span>
                                <input
                                  id={`device-upload-${item.id}`}
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  onChange={(e) => handleImageUpload(e, item.id, catId, item.title)}
                                />
                              </label>

                              {isProcessingPhoto === item.id && (
                                <span className="text-xs text-blue-600 font-semibold animate-pulse flex items-center gap-1">
                                  ⏳ Đang tối ưu & nạp ảnh...
                                </span>
                              )}
                            </div>

                            {/* Gemini AI Auto Analyze Defect Button */}
                            <button
                              type="button"
                              disabled={aiAnalyzingItemId === item.id}
                              onClick={() => handleAiAnalyzeItem(item.id, catId, item.title, item.standardRequirement)}
                              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-sm transition"
                            >
                              <Sparkles className={`w-3.5 h-3.5 ${aiAnalyzingItemId === item.id ? 'animate-spin' : ''}`} />
                              <span>{aiAnalyzingItemId === item.id ? 'Gemini Đang Phân Tích...' : 'AI Phân Tích Sự Cố'}</span>
                            </button>
                          </div>

                          {/* Display Attached Photos */}
                          {itemState.photoUrls && itemState.photoUrls.length > 0 && (
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                              {itemState.photoUrls.map((pUrl, idx) => (
                                <div key={idx} className="relative group">
                                  <img
                                    src={pUrl}
                                    alt={`Defect photo ${idx + 1}`}
                                    className="w-20 h-16 object-cover rounded-lg border border-slate-300 shadow-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const remaining = itemState.photoUrls?.filter((_, pIdx) => pIdx !== idx) || [];
                                      updateItem(item.id, catId, item.title, { photoUrls: remaining });
                                    }}
                                    className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white p-0.5 rounded-full shadow hover:bg-rose-700 transition"
                                    title="Xóa ảnh này"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Display AI Recommendation if generated */}
                          {itemState.aiRecommendation && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5 text-xs text-purple-900 space-y-1">
                              <div className="font-bold flex items-center space-x-1">
                                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                <span>Khuyến Nghị Khắc Phục Từ Gemini AI:</span>
                              </div>
                              <p>{itemState.aiRecommendation}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Step 2 */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay Lại Bước 1</span>
            </button>

            <button
              id="step2-next-btn"
              onClick={() => setStep(3)}
              className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition"
            >
              <span>Tổng Kết & Ký Tên</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SIGNATURE & SUMMARY */}
      {step === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">3. Xem Lại Báo Cáo & Xác Nhận</h2>
              <p className="text-xs text-slate-500">Phòng: {selectedRoom?.roomNumber} | Thanh tra viên: {inspectorName}</p>
            </div>

            {/* Overall Score Badge */}
            <div className="text-right">
              <div className="text-2xl font-extrabold text-slate-900">{calculateOverallScore()}%</div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {getQualityGrade(calculateOverallScore())}
              </span>
            </div>
          </div>

          {/* Executive Summary Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Ghi Chú Đánh Giá Nhận Xét Của Thanh Tra Viên
            </label>
            <textarea
              rows={3}
              value={summaryNotes}
              onChange={(e) => setSummaryNotes(e.target.value)}
              placeholder="Nhập tổng kết chung về chất lượng dịch vụ phòng, thái độ phục vụ hoặc yêu cầu kỹ thuật đặc biệt..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-slate-50"
            />
          </div>

          {/* Simple Signature Block */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Chữ Ký Điện Tử Thanh Tra Viên *
            </label>
            <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
              <div className="text-xs text-slate-500">Xác nhận bằng chữ ký số hợp lệ cho báo cáo</div>
              <div className="inline-block px-4 py-2 bg-white rounded-lg border border-slate-200 font-serif italic text-lg font-bold text-slate-800 shadow-sm">
                ✍️ {inspectorName || 'Trần Chánh Trung'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sửa Đổi Checklist</span>
            </button>

            <button
              id="submit-inspection-final-btn"
              disabled={isSubmitting}
              onClick={handleSubmitInspection}
              className="flex items-center space-x-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 transition active:scale-95"
            >
              {isSubmitting ? (
                <span>Đang Tạo Báo Cáo & Lưu Drive...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hoàn Thành & Lưu Báo Cáo</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
