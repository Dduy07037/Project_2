'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Button,
    InlineState,
    Input,
    PageHeader,
    Panel,
    Switch,
} from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/components/providers/auth-provider';
import {
    getSettings,
    updateSettings,
    type SystemSettingsDto,
    type UpdateSystemSettingsRequest,
} from '@/lib/api/exam-guard';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { AlertCircle, RefreshCw, Save } from 'lucide-react';

function mapSettingsToForm(settings: SystemSettingsDto): UpdateSystemSettingsRequest {
    return {
        siteName: settings.siteName,
        maintenanceMode: settings.maintenanceMode,
        maxLoginAttempts: settings.maxLoginAttempts,
        sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
        tabSwitchWarning: settings.tabSwitchWarning,
        maxTabSwitches: settings.maxTabSwitches,
        autoSubmitOnTabLimit: settings.autoSubmitOnTabLimit,
        allowCopyPaste: settings.allowCopyPaste,
        showResultToStudent: settings.showResultToStudent,
        rapidAnswerThresholdSeconds: settings.rapidAnswerThresholdSeconds,
    };
}

export default function AdminSettingsPage() {
    const { request } = useAuth();
    const { toast } = useToast();

    const [settings, setSettings] = useState<UpdateSystemSettingsRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadSettings = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getSettings(request);
            setSettings(mapSettingsToForm(response));
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Không thể tải cấu hình hệ thống.');
        } finally {
            setLoading(false);
        }
    }, [request]);

    useEffect(() => {
        void loadSettings();
    }, [loadSettings]);

    const handleSave = useCallback(async () => {
        if (!settings) {
            return;
        }

        setSaving(true);

        try {
            const updated = await updateSettings(request, settings);
            setSettings(mapSettingsToForm(updated));
            toast({ type: 'success', title: 'Da luu cau hinh he thong' });
        } catch (saveError) {
            toast({
                type: 'error',
                title: 'Lưu cấu hình thất bại',
                message: saveError instanceof Error ? saveError.message : 'Da xay ra loi khong xac dinh.',
            });
        } finally {
            setSaving(false);
        }
    }, [request, settings, toast]);

    if (error && !settings) {
        return (
            <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
                <motion.div variants={staggerItem}>
                    <PageHeader title="Cấu hình hệ thống" description="Dữ liệu đang được đọc từ bảng SystemSettings thật." />
                </motion.div>
                <motion.div variants={staggerItem}>
                    <InlineState
                        icon={<AlertCircle className="h-10 w-10" />}
                        title="Không thể tải cấu hình"
                        description={error}
                        actions={(
                            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadSettings()}>
                                Thử lại
                            </Button>
                        )}
                    />
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader
                    title="Cấu hình hệ thống"
                    description="Cac gia tri ben duoi dang map truc tiep toi bang SystemSettings."
                    actions={(
                        <Button icon={<Save className="h-4 w-4" />} onClick={() => void handleSave()} loading={saving} disabled={!settings || loading}>
                            Lưu thay đổi
                        </Button>
                    )}
                />
            </motion.div>

            {!settings ? (
                <motion.div variants={staggerItem}>
                    <InlineState title="Đang tải cấu hình" description="ExamGuard đang đọc cấu hình hệ thống từ backend." />
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
                    <motion.div variants={staggerItem}>
                        <Panel title="Thông tin chung">
                            <div className="space-y-4">
                                <Input
                                    label="Tên hệ thống"
                                    value={settings.siteName}
                                    onChange={(event) => setSettings((current) => current ? { ...current, siteName: event.target.value } : current)}
                                />
                                <Input
                                    label="So lan dang nhap toi da"
                                    type="number"
                                    value={String(settings.maxLoginAttempts)}
                                    onChange={(event) => setSettings((current) => current ? { ...current, maxLoginAttempts: Number(event.target.value) || 0 } : current)}
                                />
                                <Input
                                    label="Session timeout (phut)"
                                    type="number"
                                    value={String(settings.sessionTimeoutMinutes)}
                                    onChange={(event) => setSettings((current) => current ? { ...current, sessionTimeoutMinutes: Number(event.target.value) || 0 } : current)}
                                />
                            </div>
                        </Panel>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                        <Panel title="Anti-cheat">
                            <div className="space-y-5">
                                <Switch
                                    label="Canh bao khi roi tab"
                                    checked={settings.tabSwitchWarning}
                                    onChange={(value) => setSettings((current) => current ? { ...current, tabSwitchWarning: value } : current)}
                                />
                                <Input
                                    label="Gioi han roi tab"
                                    type="number"
                                    value={String(settings.maxTabSwitches)}
                                    onChange={(event) => setSettings((current) => current ? { ...current, maxTabSwitches: Number(event.target.value) || 0 } : current)}
                                />
                                <Switch
                                    label="Auto-submit khi vuot gioi han"
                                    checked={settings.autoSubmitOnTabLimit}
                                    onChange={(value) => setSettings((current) => current ? { ...current, autoSubmitOnTabLimit: value } : current)}
                                />
                                <Switch
                                    label="Cho phep copy/paste"
                                    checked={settings.allowCopyPaste}
                                    onChange={(value) => setSettings((current) => current ? { ...current, allowCopyPaste: value } : current)}
                                />
                                <Input
                                    label="Nguong rapid answer (giay)"
                                    type="number"
                                    value={String(settings.rapidAnswerThresholdSeconds)}
                                    onChange={(event) => setSettings((current) => current ? { ...current, rapidAnswerThresholdSeconds: Number(event.target.value) || 0 } : current)}
                                />
                            </div>
                        </Panel>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                        <Panel title="Hien thi va ket qua">
                            <div className="space-y-5">
                                <Switch
                                    label="Cho sinh vien xem ket qua"
                                    checked={settings.showResultToStudent}
                                    onChange={(value) => setSettings((current) => current ? { ...current, showResultToStudent: value } : current)}
                                />
                            </div>
                        </Panel>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                        <Panel title="Bao tri">
                            <div className="space-y-5">
                                <Switch
                                    label="Bat maintenance mode"
                                    checked={settings.maintenanceMode}
                                    onChange={(value) => setSettings((current) => current ? { ...current, maintenanceMode: value } : current)}
                                />
                            </div>
                        </Panel>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
