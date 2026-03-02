import { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    ShieldAlert,
    Save,
    Camera,
    Heart,
    Briefcase,
    Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { dummyStudentUser } from '@/lib/dummyData';
import { updateStudent } from '@/lib/supabase';

export default function Profile() {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: dummyStudentUser.first_name,
        last_name: dummyStudentUser.last_name,
        email: dummyStudentUser.email,
        phone: dummyStudentUser.phone,
        emergency_contact_name: dummyStudentUser.emergency_contact_name,
        emergency_contact_phone: dummyStudentUser.emergency_contact_phone,
        emergency_contact_relation: dummyStudentUser.emergency_contact_relation,
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateStudent(dummyStudentUser.id, formData);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Profile Settings</h1>
                <p className="text-muted-foreground font-medium">Manage your personal information and contacts</p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Personal Details */}
                <Card className="border-none shadow-xl shadow-border/20 rounded-[2.5rem] overflow-hidden bg-card">
                    <CardHeader className="p-8 border-b border-border bg-muted/50">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative group">
                                <Avatar className="w-32 h-32 border-8 border-background shadow-xl">
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-4xl font-black">
                                        {formData.first_name[0]}{formData.last_name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <h2 className="text-3xl font-black text-foreground mb-2">{formData.first_name} {formData.last_name}</h2>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold px-4 py-1 rounded-full">{dummyStudentUser.student_id}</Badge>
                                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 font-bold px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">Active Resident</Badge>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-7 rounded-2xl font-bold shadow-lg shadow-primary/20 hidden md:flex items-center gap-2"
                                disabled={isSaving}
                            >
                                <Save className="w-5 h-5" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 lg:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="font-bold text-muted-foreground flex items-center gap-2"><User className="w-4 h-4 text-primary" /> First Name</Label>
                                <Input
                                    value={formData.first_name}
                                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                    className="rounded-2xl py-7 border-border bg-background focus:ring-primary/20 transition-all text-lg font-medium"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="font-bold text-muted-foreground flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Last Name</Label>
                                <Input
                                    value={formData.last_name}
                                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                    className="rounded-2xl py-7 border-border bg-background focus:ring-primary/20 transition-all text-lg font-medium"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="font-bold text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Email Address</Label>
                                <Input
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="rounded-2xl py-7 border-border bg-background focus:ring-primary/20 transition-all text-lg font-medium"
                                    type="email"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="font-bold text-muted-foreground flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> Phone Number</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="rounded-2xl py-7 border-border bg-background focus:ring-primary/20 transition-all text-lg font-medium"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card className="border-none shadow-xl shadow-border/20 rounded-[2.5rem] overflow-hidden border-l-4 border-destructive bg-card">
                    <CardHeader className="p-8 border-b border-border bg-destructive/5">
                        <CardTitle className="text-2xl font-bold flex items-center gap-3 text-foreground">
                            <ShieldAlert className="w-7 h-7 text-destructive" />
                            Emergency Information
                        </CardTitle>
                        <CardDescription className="text-muted-foreground font-medium pt-1">Information for crisis situations</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 lg:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="font-bold text-muted-foreground flex items-center gap-2"><Heart className="w-4 h-4 text-destructive" /> Contact Name</Label>
                                <Input
                                    value={formData.emergency_contact_name}
                                    onChange={e => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                                    className="rounded-2xl py-7 border-border bg-background focus:ring-destructive/20 transition-all text-lg font-medium"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="font-bold text-muted-foreground flex items-center gap-2"><Briefcase className="w-4 h-4 text-destructive" /> Relationship</Label>
                                <Input
                                    value={formData.emergency_contact_relation}
                                    onChange={e => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                                    className="rounded-2xl py-7 border-border bg-background focus:ring-destructive/20 transition-all text-lg font-medium"
                                />
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <Label className="font-bold text-muted-foreground flex items-center gap-2"><Smartphone className="w-4 h-4 text-destructive" /> Emergency Phone</Label>
                                <Input
                                    value={formData.emergency_contact_phone}
                                    onChange={e => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                                    className="rounded-2xl py-7 border-border bg-background focus:ring-destructive/20 transition-all text-lg font-medium"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="pt-4 md:hidden">
                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-8 rounded-[2rem] text-xl font-bold shadow-xl shadow-primary/20"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Updating Profile...' : 'Update Profile'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
