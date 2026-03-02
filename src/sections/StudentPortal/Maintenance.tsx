import { useEffect, useState } from 'react';
import {
    Wrench,
    Plus,
    Search,
    Clock,
    Camera,
    MessageSquare,
    Filter,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getMaintenanceTickets, createMaintenanceTicket } from '@/lib/supabase';
import { dummyStudentUser } from '@/lib/dummyData';
import type { MaintenanceTicket } from '@/types';

export default function Maintenance() {
    const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'other',
        priority: 'medium'
    });

    const fetchTickets = async () => {
        try {
            setIsLoading(true);
            const data = await getMaintenanceTickets(dummyStudentUser.id);
            setTickets(data);
        } catch (error) {
            toast.error('Failed to load tickets');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            await createMaintenanceTicket({
                ...formData,
                student_id: dummyStudentUser.id
            });
            toast.success('Maintenance ticket submitted successfully!');
            setIsDialogOpen(false);
            setFormData({ title: '', description: '', category: 'other', priority: 'medium' });
            fetchTickets();
        } catch (error) {
            toast.error('Failed to submit ticket');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
            case 'in-progress':
                return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">In Progress</Badge>;
            case 'resolved':
                return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Resolved</Badge>;
            case 'closed':
                return <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Closed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high':
                return <Badge variant="destructive" className="px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-wider">High</Badge>;
            case 'medium':
                return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-wider">Medium</Badge>;
            case 'low':
                return <Badge variant="secondary" className="px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-wider">Low</Badge>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Maintenance</h1>
                    <p className="text-muted-foreground font-medium">Request repairs and track their status</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-6 rounded-2xl font-bold shadow-lg shadow-primary/20 gap-2">
                            <Plus className="w-5 h-5" />
                            New Ticket
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8 border-none shadow-2xl bg-card">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-foreground">Report a Problem</DialogTitle>
                            <DialogDescription className="text-muted-foreground pt-2">
                                Provide details about the issue and we'll fix it as soon as possible.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="font-bold text-gray-700">Short Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Leaking shower head"
                                    className="rounded-xl py-6 border-gray-200"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-bold text-muted-foreground">Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={v => setFormData({ ...formData, category: v })}
                                    >
                                        <SelectTrigger className="rounded-xl py-6 border-border bg-background">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="plumbing">Plumbing</SelectItem>
                                            <SelectItem value="electrical">Electrical</SelectItem>
                                            <SelectItem value="furniture">Furniture</SelectItem>
                                            <SelectItem value="cleaning">Cleaning</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-muted-foreground">Priority</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={v => setFormData({ ...formData, priority: v })}
                                    >
                                        <SelectTrigger className="rounded-xl py-6 border-border bg-background">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High (Urgent)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="font-bold text-gray-700">Detailed Description *</Label>
                                <Textarea
                                    id="description"
                                    placeholder="What's specifically happening? Where is it?"
                                    className="rounded-xl min-h-[120px] border-gray-200 pt-4"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 text-center">
                                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <Camera className="w-8 h-8 text-gray-300 mx-auto mb-2 group-hover:text-[#1a73e8] transition-colors" />
                                    <p className="text-sm font-bold text-gray-400">Add Photos (Optional)</p>
                                    <p className="text-[10px] text-gray-400 mt-1">Tap to capture or upload</p>
                                </div>
                            </div>
                            <DialogFooter className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-[#1a73e8] hover:bg-[#1557b0] py-6 rounded-2xl font-bold shadow-lg shadow-blue-200"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#1a73e8] transition-colors" />
                    <Input
                        placeholder="Search tickets..."
                        className="pl-12 py-7 rounded-2xl border-none shadow-xl shadow-gray-200/50"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px] py-7 rounded-2xl border-none shadow-xl shadow-gray-200/50 font-bold text-[#202124]">
                            <span className="flex items-center gap-2"><Filter className="w-4 h-4 text-gray-400" /><SelectValue placeholder="Status" /></span>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-bold animate-pulse">Loading your requests...</p>
                </div>
            ) : filteredTickets.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl shadow-gray-200/50">
                    <Wrench className="w-20 h-20 text-gray-200 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-[#202124] mb-2">No tickets found</h2>
                    <p className="text-gray-500 font-medium max-w-sm mx-auto">Everything seems to be working perfectly! If you notice any issues, click "New Ticket" to let us know.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredTickets.map((ticket) => (
                        <Card key={ticket.id} className="border-none shadow-xl shadow-gray-200/50 rounded-[2rem] overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                            <CardHeader className="bg-[#f8f9fa]/50 border-b border-gray-100 p-6 flex flex-row items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        {getStatusBadge(ticket.status)}
                                        {getPriorityBadge(ticket.priority)}
                                    </div>
                                    <CardTitle className="text-xl font-bold text-[#202124] line-clamp-1">{ticket.title}</CardTitle>
                                </div>
                                <Badge variant="outline" className="capitalize bg-white text-gray-500 border-gray-100 font-bold">
                                    {ticket.category}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-muted-foreground text-sm font-medium line-clamp-2 mb-6 min-h-[40px]">
                                    {ticket.description}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(ticket.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                        <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> 0</span>
                                    </div>
                                    <Button variant="ghost" className="text-primary font-bold text-sm h-8 rounded-full group-hover:bg-primary/10">
                                        Details
                                        <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-all" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
