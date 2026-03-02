import { useEffect, useState, useCallback } from 'react';
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit2,
    Trash2,
    Mail,
    ShieldCheck,
    Loader2,
    Copy
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getStaff, addStaff, deleteStaff } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface StaffFormData {
    first_name: string;
    last_name: string;
    email: string;
    role: 'admin' | 'staff';
}

const initialFormData: StaffFormData = {
    first_name: '',
    last_name: '',
    email: '',
    role: 'staff'
};

export default function StaffManagement() {
    const { user } = useAuth();
    const isCeo = user?.user_metadata?.is_ceo === true || user?.user_metadata?.role === 'admin';

    const [staff, setStaff] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
    const [formData, setFormData] = useState<StaffFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchStaff = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await getStaff();
            setStaff(data || []);
        } catch (error) {
            console.error('Error fetching staff:', error);
            toast.error('Failed to load staff members');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    const filteredStaff = staff.filter(member =>
        member.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddStaff = async () => {
        try {
            setIsSubmitting(true);
            await addStaff(formData);
            toast.success('Staff member added and invitation sent');
            setIsAddDialogOpen(false);
            setFormData(initialFormData);
            fetchStaff();
        } catch (error) {
            console.error('Error adding staff:', error);
            toast.error('Failed to add staff member');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteStaff = async () => {
        if (!selectedStaff) return;
        try {
            setIsSubmitting(true);
            await deleteStaff(selectedStaff.id);
            toast.success('Staff member removed');
            setIsDeleteDialogOpen(false);
            setSelectedStaff(null);
            fetchStaff();
        } catch (error) {
            console.error('Error deleting staff:', error);
            toast.error('Failed to remove staff member');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isCeo) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <ShieldCheck className="w-16 h-16 text-muted-foreground/20 mb-4" />
                <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
                <p className="text-muted-foreground max-w-sm mx-auto mt-2 font-medium">
                    Only the CEO / Primary Admin can manage staff members.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">Staff Management</h1>
                    <p className="text-sm text-muted-foreground font-medium">Add and manage your administrative team</p>
                </div>
                <Button
                    className="bg-[#0d5c63] hover:bg-[#0a4a50] text-white rounded-xl font-bold"
                    onClick={() => setIsAddDialogOpen(true)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Staff
                </Button>
            </div>

            <Card className="border-border shadow-sm overflow-hidden bg-card">
                <CardHeader className="border-b border-border bg-muted/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-background border-border"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/80">
                                <tr>
                                    <th className="text-left py-4 px-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Name</th>
                                    <th className="text-left py-4 px-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Role</th>
                                    <th className="text-left py-4 px-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Joined</th>
                                    <th className="text-right py-4 px-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12">
                                            <Loader2 className="w-8 h-8 animate-spin text-[#0d5c63] mx-auto" />
                                        </td>
                                    </tr>
                                ) : filteredStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12 text-muted-foreground font-medium">
                                            No staff members found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStaff.map((member) => (
                                        <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
                                                        {member.first_name[0]}{member.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground">{member.first_name} {member.last_name}</p>
                                                        <p className="text-xs text-muted-foreground font-medium">{member.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${member.role === 'admin'
                                                    ? 'bg-teal-500/10 text-teal-600 border-teal-500/20'
                                                    : 'bg-muted text-muted-foreground border-border'
                                                    }`}>
                                                    {member.role}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-muted-foreground font-medium">
                                                {new Date(member.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-popover border-border">
                                                        <DropdownMenuItem
                                                            className="text-foreground"
                                                            onClick={() => {
                                                                const link = `${window.location.origin}/admin/login?email=${member.email}`;
                                                                navigator.clipboard.writeText(link);
                                                                toast.success('Invitation link copied to clipboard!');
                                                            }}
                                                        >
                                                            <Copy className="w-4 h-4 mr-2" />
                                                            Copy Invite Link
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-foreground">
                                                            <Edit2 className="w-4 h-4 mr-2" />
                                                            Edit Permissions
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-500 focus:text-red-600 focus:bg-red-50"
                                                            onClick={() => {
                                                                setSelectedStaff(member);
                                                                setIsDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Remove Staff
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Add Staff Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-foreground">Add Team Member</DialogTitle>
                        <DialogDescription className="font-medium text-muted-foreground">
                            Invite a new staff member to manage the system.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">First Name</Label>
                                <Input
                                    placeholder="First name"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="rounded-xl border-border bg-background"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Last Name</Label>
                                <Input
                                    placeholder="Last name"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="rounded-xl border-border bg-background"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="pl-10 rounded-xl border-border bg-background"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(v: any) => setFormData({ ...formData, role: v })}
                            >
                                <SelectTrigger className="rounded-xl border-border bg-background">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="staff">Staff (Limited Access)</SelectItem>
                                    <SelectItem value="admin">Manager (Full Access)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" className="font-bold text-muted-foreground" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-[#0d5c63] hover:bg-[#0a4a50] text-white font-bold rounded-xl"
                            onClick={handleAddStaff}
                            disabled={isSubmitting || !formData.email || !formData.first_name}
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            Send Invitation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-sm rounded-3xl bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-destructive">Remove Staff Member?</DialogTitle>
                        <DialogDescription className="font-medium text-muted-foreground">
                            This will immediately revoke their access to the system. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 sm:gap-0 mt-4">
                        <Button variant="ghost" className="flex-1 font-bold text-muted-foreground" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            className="flex-1 font-bold rounded-xl"
                            onClick={handleDeleteStaff}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Revoke Access
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
