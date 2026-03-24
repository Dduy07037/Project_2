'use client';

import { motion } from 'framer-motion';
import { PageHeader, Panel, Button, Avatar, Badge, Input, Textarea } from '@/components/ui';
import { Separator } from '@/components/ui/badge';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { useToast } from '@/components/ui/toast';
import { Save, Camera, Mail, Phone, Building2, GraduationCap } from 'lucide-react';

export default function ProfilePage() {
    const { toast } = useToast();

    return (
        <div className="min-h-screen bg-bg-primary">
            <div className="max-w-3xl mx-auto py-10 px-6">
                <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
                    <motion.div variants={staggerItem}>
                        <PageHeader title="Hồ sơ cá nhân" description="Quản lý thông tin tài khoản của bạn" />
                    </motion.div>

                    {/* Avatar Section */}
                    <motion.div variants={staggerItem}>
                        <Panel>
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                    <Avatar name="Trần Thị Minh Anh" size="lg" />
                                    <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center border-2 border-bg-secondary cursor-pointer">
                                        <Camera className="h-3 w-3 text-white" />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-text-primary">Trần Thị Minh Anh</h3>
                                    <p className="text-sm text-text-muted">lecturer1@hcmut.edu.vn</p>
                                    <Badge variant="info" className="mt-1">Giảng viên</Badge>
                                </div>
                            </div>
                        </Panel>
                    </motion.div>

                    {/* Personal Info */}
                    <motion.div variants={staggerItem}>
                        <Panel title="Thông tin cá nhân" action={
                            <Button size="sm" icon={<Save className="h-3 w-3" />} onClick={() => toast({ type: 'success', title: 'Đã cập nhật' })}>
                                Lưu
                            </Button>
                        }>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="Họ" defaultValue="Trần Thị" />
                                <Input label="Tên" defaultValue="Minh Anh" />
                                <Input label="Email" type="email" defaultValue="lecturer1@hcmut.edu.vn" disabled icon={<Mail className="h-4 w-4" />} />
                                <Input label="Số điện thoại" defaultValue="0901234567" icon={<Phone className="h-4 w-4" />} />
                                <Input label="Khoa" defaultValue="Khoa CNTT" icon={<Building2 className="h-4 w-4" />} />
                                <Input label="Chức danh" defaultValue="Giảng viên" icon={<GraduationCap className="h-4 w-4" />} />
                            </div>
                        </Panel>
                    </motion.div>

                    {/* Change Password */}
                    <motion.div variants={staggerItem}>
                        <Panel title="Đổi mật khẩu" action={
                            <Button size="sm" variant="secondary" onClick={() => toast({ type: 'success', title: 'Mật khẩu đã thay đổi' })}>
                                Đổi mật khẩu
                            </Button>
                        }>
                            <div className="space-y-4 max-w-sm">
                                <Input label="Mật khẩu hiện tại" type="password" placeholder="••••••••" />
                                <Input label="Mật khẩu mới" type="password" placeholder="••••••••" />
                                <Input label="Xác nhận mật khẩu mới" type="password" placeholder="••••••••" />
                            </div>
                        </Panel>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
