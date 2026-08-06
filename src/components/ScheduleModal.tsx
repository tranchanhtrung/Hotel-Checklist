import React, { useState } from 'react';
import { CalendarClock, Mail, Cloud, Check, Bell, Sparkles } from 'lucide-react';
import { ScheduleConfig } from '../types';

interface ScheduleModalProps {
  config: ScheduleConfig;
  onClose: () => void;
  onSaveConfig: (updated: ScheduleConfig) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  config,
  onClose,
  onSaveConfig,
}) => {
  const [enabled, setEnabled] = useState<boolean>(config.enabled);
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>(config.frequency);
  const [recipientsText, setRecipientsText] = useState<string>(config.recipients.join(', '));
  const [autoUploadDrive, setAutoUploadDrive] = useState<boolean>(config.autoUploadDrive);
  const [reportTime, setReportTime] = useState<string>(config.reportTime || '17:00');
  const [saveNotice, setSaveNotice] = useState<string>('');

  const handleSave = () => {
    const splitRecipients = recipientsText
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    const updated: ScheduleConfig = {
      enabled,
      frequency,
      recipients: splitRecipients.length > 0 ? splitRecipients : ['tranchanhtrung@gmail.com'],
      autoUploadDrive,
      reportTime,
      lastRunAt: new Date().toISOString(),
    };

    onSaveConfig(updated);
    setSaveNotice('✅ Đã lưu cấu hình gửi báo cáo PDF & Google Drive định kỳ!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Cấu Hình Gửi Báo Cáo PDF & Drive Định Kỳ</h2>
              <p className="text-xs text-slate-500">Tự động tổng hợp báo cáo kiểm tra khách sạn gửi qua Email & Google Drive</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Toggle Enable */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-900">Kích Hoạt Gửi Tự Động</div>
              <div className="text-[11px] text-slate-500">Gửi tổng hợp báo cáo định kỳ theo lịch lập sẵn</div>
            </div>

            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                enabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tần Suất Tổng Hợp</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'DAILY', label: 'Hàng Ngày' },
                { id: 'WEEKLY', label: 'Hàng Tuần' },
                { id: 'MONTHLY', label: 'Hàng Tháng' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFrequency(item.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    frequency === item.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time & Drive Sync Options */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Giờ Gửi Báo Cáo</label>
              <input
                type="time"
                value={reportTime}
                onChange={(e) => setReportTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={autoUploadDrive}
                  onChange={(e) => setAutoUploadDrive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Tự động sao lưu Google Drive</span>
              </label>
            </div>
          </div>

          {/* Recipients List */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Danh Sách Email Nhận Báo Cáo (Phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={recipientsText}
              onChange={(e) => setRecipientsText(e.target.value)}
              placeholder="tranchanhtrung@gmail.com, gm@hotel.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50"
            />
          </div>

          {saveNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold">
              {saveNotice}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 shadow-sm"
          >
            Lưu Lịch Định Kỳ
          </button>
        </div>
      </div>
    </div>
  );
};
