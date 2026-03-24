'use client';

import { motion } from 'framer-motion';
import { PageHeader, Panel, Card, Button, StatusBadge, Badge, Avatar } from '@/components/ui';
import { Input, Textarea } from '@/components/ui/input';
import { Switch } from '@/components/ui/tabs';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { mockSettings } from '@/lib/mock-data';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';
import { Save, Shield, Bell, Clock, Monitor, Eye } from 'lucide-react';

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState(mockSettings);

    const handleSave = () => {
        toast({ type: 'success', title: 'Đã lưu', message: 'Cấu hình hệ thống đã được cập nhật' });
    };

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader
                    title="Cấu hình hệ thống"
                    description="Cài đặt chung cho hệ thống thi ExamGuard"
                    actions={<Button icon={<Save className="h-4 w-4" />} onClick={handleSave}>Lưu thay đổi</Button>}
                />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
                <motion.div variants={staggerItem}>
                    <Panel title="Thông tin chung">
                        <div className="space-y-4">
                            <Input label="Tên hệ thống" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
                            <Input label="Số lần đăng nhập tối đa" type="number" value={String(settings.maxLoginAttempts)} onChange={(e) => setSettings({ ...settings, maxLoginAttempts: Number(e.target.value) })} hint="Số lần đăng nhập thất bại trước khi khóa tài khoản" />
                            <Input label="Timeout phiên (phút)" type="number" value={String(settings.sessionTimeout)} onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })} />
                        </div>
                    </Panel>
                </motion.div>

                <motion.div variants={staggerItem}>
                    <Panel title="Chống gian lận">
                        <div className="space-y-5">
                            <Switch label="Cảnh báo khi rời tab" checked={settings.tabSwitchWarning} onChange={(v) => setSettings({ ...settings, tabSwitchWarning: v })} />
                            <Input label="Giới hạn rời tab tối đa" type="number" value={String(settings.maxTabSwitches)} onChange={(e) => setSettings({ ...settings, maxTabSwitches: Number(e.target.value) })} hint="Số lần rời tab tối đa trong một phiên thi" />
                            <Switch label="Tự động nộp bài khi vượt giới hạn" checked={settings.autoSubmitOnTabLimit} onChange={(v) => setSettings({ ...settings, autoSubmitOnTabLimit: v })} />
                            <Switch label="Cho phép copy/paste" checked={settings.allowCopyPaste} onChange={(v) => setSettings({ ...settings, allowCopyPaste: v })} />
                        </div>
                    </Panel>
                </motion.div>

                <motion.div variants={staggerItem}>
                    <Panel title="Hiển thị kết quả">
                        <div className="space-y-5">
                            <Switch label="Cho sinh viên xem kết quả" checked={settings.showResultToStudent} onChange={(v) => setSettings({ ...settings, showResultToStudent: v })} />
                        </div>
                    </Panel>
                </motion.div>

                <motion.div variants={staggerItem}>
                    <Panel title="Bảo trì">
                        <div className="space-y-5">
                            <Switch label="Chế độ bảo trì" checked={settings.maintenanceMode} onChange={(v) => setSettings({ ...settings, maintenanceMode: v })} />
                            {settings.maintenanceMode && (
                                <div className="bg-warning/5 border border-warning/20 rounded-[var(--radius-md)] p-3">
                                    <p className="text-xs text-warning font-medium">Khi bật chế độ bảo trì, sinh viên sẽ không thể truy cập hệ thống.</p>
                                </div>
                            )}
                        </div>
                    </Panel>
                </motion.div>
            </div>
        </motion.div>
    );
}
