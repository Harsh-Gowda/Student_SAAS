import { useEffect, useState } from 'react';
import {
    CreditCard,
    Download,
    Search,
    ArrowUpRight,
    TrendingUp,
    Clock,
    AlertCircle,
    FileText,
    Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { getPayments } from '@/lib/supabase';
import { dummyStudentUser } from '@/lib/dummyData';
import type { Payment } from '@/types';

export default function Finances() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchPayments = async () => {
        try {
            setIsLoading(true);
            const data = await getPayments({ student_id: dummyStudentUser.id });
            setPayments(data);
        } catch (error) {
            toast.error('Failed to load payment history');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const totalPaid = payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = payments
        .filter(p => p.status !== 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

    const filteredPayments = payments.filter(p => {
        const matchesSearch = p.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.status.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none font-bold rounded-full px-4">Paid</Badge>;
            case 'pending':
                return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none font-bold rounded-full px-4">Pending</Badge>;
            case 'overdue':
                return <Badge className="bg-red-500/10 text-destructive hover:bg-red-500/20 border-none font-bold rounded-full px-4">Overdue</Badge>;
            default:
                return <Badge className="font-bold rounded-full px-4">{status}</Badge>;
        }
    };

    const handleDownloadReceipt = (id: string) => {
        toast.success('Downloading receipt for transaction #' + id);
        // In a real app, this would trigger a file download
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Finances</h1>
                <p className="text-muted-foreground font-medium">Manage your rent payments and view history</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-none shadow-xl shadow-border/20 rounded-[2.5rem] bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-blue-100" />
                        </div>
                        <ArrowUpRight className="w-6 h-6 text-blue-200 opacity-50" />
                    </div>
                    <p className="text-blue-100/70 font-bold uppercase tracking-widest text-[10px] mb-1">Total Paid This Year</p>
                    <h2 className="text-4xl font-black mb-4">₹{totalPaid.toLocaleString()}</h2>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white/40 w-[70%]" />
                    </div>
                </Card>

                <Card className="border-none shadow-xl shadow-border/20 rounded-[2.5rem] bg-card p-8 border border-border">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-destructive" />
                        </div>
                        <AlertCircle className="w-6 h-6 text-destructive opacity-20" />
                    </div>
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Outstanding Balance</p>
                    <h2 className="text-4xl font-black text-foreground mb-4">₹{pendingAmount.toLocaleString()}</h2>
                    <Progress value={pendingAmount > 0 ? 40 : 100} className="h-1.5 bg-muted" />
                </Card>

                <Card className="border-none shadow-xl shadow-border/20 rounded-[2.5rem] bg-muted/50 p-8 lg:flex items-center justify-center hidden border border-border">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-card rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-border">
                            <CreditCard className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <p className="font-bold text-foreground">Auto-pay isActive</p>
                            <p className="text-xs text-muted-foreground font-medium">Rent is deducted on the 1st</p>
                        </div>
                        <Button variant="outline" className="rounded-full px-6 font-bold text-xs h-8 border-border">Manage</Button>
                    </div>
                </Card>
            </div>

            <Card className="border-none shadow-xl shadow-border/20 rounded-[2.5rem] overflow-hidden bg-card border border-border">
                <CardHeader className="p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3 text-foreground">
                        <FileText className="w-6 h-6 text-primary" />
                        Payment History
                    </CardTitle>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Transaction ID..."
                                className="pl-9 py-5 rounded-xl border-gray-100 min-w-[200px]"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[140px] py-5 rounded-xl border-gray-100 font-bold text-sm">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="text-center py-20">
                            <CreditCard className="w-16 h-16 text-muted/20 mx-auto mb-4" />
                            <p className="text-muted-foreground font-bold">No transactions found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-8 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Due Date</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Transaction ID</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Amount</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Status</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredPayments.map((p) => (
                                        <tr key={p.id} className="group hover:bg-muted/30 transition-colors">
                                            <td className="px-8 py-6 font-bold text-foreground whitespace-nowrap">
                                                {new Date(p.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                                                    {p.transaction_id || '---'}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6 font-black text-foreground whitespace-nowrap">
                                                ₹{p.amount.toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                {getStatusBadge(p.status)}
                                            </td>
                                            <td className="px-8 py-6 text-right whitespace-nowrap">
                                                {p.status === 'paid' ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full text-primary hover:bg-primary/10"
                                                        onClick={() => handleDownloadReceipt(p.id)}
                                                    >
                                                        <Download className="w-5 h-5" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 px-6 rounded-full shadow-md shadow-primary/20"
                                                        onClick={() => toast.info('Navigating to payment gateway...')}
                                                    >
                                                        Pay
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex items-center gap-3 bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
                <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center shadow-sm border border-border">
                    <Info className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h4 className="font-bold text-primary">About Payment Settlements</h4>
                    <p className="text-sm text-primary/70 font-medium">It may take up to 24 hours for transaction status to reflect in your dashboard after paying via bank transfer.</p>
                </div>
            </div>
        </div>
    );
}
