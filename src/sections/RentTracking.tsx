import { useEffect, useState, useCallback } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  User,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format, parseISO, isBefore } from 'date-fns';
import * as XLSX from 'xlsx';
import {
  getPayments,
  createPayment,
  updatePayment,
  markPaymentAsPaid,
  getStudents,
  getRooms
} from '@/lib/supabase';
import type { Payment, Student, Room } from '@/types';

interface PaymentFormData {
  student_id: string;
  room_id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: 'pending' | 'paid' | 'overdue';
  payment_method: string;
  transaction_id: string;
  notes: string;
}

const initialFormData: PaymentFormData = {
  student_id: '',
  room_id: '',
  amount: 0,
  due_date: '',
  paid_date: null,
  status: 'pending',
  payment_method: '',
  transaction_id: '',
  notes: ''
};

const paymentMethods = [
  'Cash',
  'Bank Transfer',
  'UPI',
  'Credit Card',
  'Debit Card',
  'Check'
];

export default function RentTracking() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isMarkPaidDialogOpen, setIsMarkPaidDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>(initialFormData);
  const [markPaidData, setMarkPaidData] = useState({
    paid_date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: 'Cash',
    transaction_id: ''
  });
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [paymentsData, studentsData, roomsData] = await Promise.all([
        getPayments(),
        getStudents(),
        getRooms()
      ]);
      setPayments(paymentsData || []);
      setStudents(studentsData || []);
      setRooms(roomsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-update overdue payments
  useEffect(() => {
    const checkOverduePayments = async () => {
      const today = new Date().toISOString().split('T')[0];
      const overduePayments = payments.filter(p =>
        p.status === 'pending' && isBefore(parseISO(p.due_date), parseISO(today))
      );

      for (const payment of overduePayments) {
        try {
          await updatePayment(payment.id, { status: 'overdue' });
        } catch (error) {
          console.error('Error updating overdue payment:', error);
        }
      }

      if (overduePayments.length > 0) {
        fetchData();
      }
    };

    checkOverduePayments();
  }, [payments]);

  const filteredPayments = payments.filter(payment => {
    const studentName = `${payment.student?.first_name} ${payment.student?.last_name}`.toLowerCase();
    const matchesSearch =
      studentName.includes(searchQuery.toLowerCase()) ||
      payment.student?.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMonth = monthFilter === 'all' || payment.due_date.startsWith(monthFilter);
    const matchesTab = activeTab === 'all' || payment.status === activeTab;

    return matchesSearch && matchesStatus && matchesMonth && matchesTab;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddPayment = async () => {
    try {
      await createPayment(formData);
      toast.success('Payment record added successfully');
      setIsAddDialogOpen(false);
      setFormData(initialFormData);
      fetchData();
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Failed to add payment record');
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedPayment) return;
    try {
      await markPaymentAsPaid(selectedPayment.id, {
        paid_date: markPaidData.paid_date,
        payment_method: markPaidData.payment_method,
        transaction_id: markPaidData.transaction_id
      });
      toast.success('Payment marked as paid');
      setIsMarkPaidDialogOpen(false);
      setSelectedPayment(null);
      setMarkPaidData({
        paid_date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: 'Cash',
        transaction_id: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      toast.error('Failed to mark payment as paid');
    }
  };

  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student && student.room) {
      setFormData({
        ...formData,
        student_id: studentId,
        room_id: student.room_id || '',
        amount: student.room.monthly_rent
      });
    } else {
      setFormData({
        ...formData,
        student_id: studentId,
        room_id: '',
        amount: 0
      });
    }
  };

  const exportToExcel = () => {
    const exportData = filteredPayments.map(p => ({
      'Student Name': `${p.student?.first_name} ${p.student?.last_name}`,
      'Student ID': p.student?.student_id,
      'Email': p.student?.email,
      'Room': p.room?.room_number,
      'Building': p.room?.building?.name,
      'Amount': p.amount,
      'Due Date': p.due_date,
      'Paid Date': p.paid_date || '-',
      'Status': p.status,
      'Payment Method': p.payment_method || '-',
      'Transaction ID': p.transaction_id || '-',
      'Notes': p.notes || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, `payments_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success('Payments exported successfully');
  };

  const openMarkPaidDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsMarkPaidDialogOpen(true);
  };

  const openViewDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      paid: 'bg-green-500/10 text-green-600 border-green-500/20',
      pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      overdue: 'bg-red-500/10 text-destructive border-destructive/20'
    };
    const icons = {
      paid: CheckCircle2,
      pending: Clock,
      overdue: AlertCircle
    };
    const Icon = icons[status as keyof typeof icons];
    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles]}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = {
    total: payments.reduce((sum, p) => sum + p.amount, 0),
    paid: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    overdue: payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0),
    count: {
      total: payments.length,
      paid: payments.filter(p => p.status === 'paid').length,
      pending: payments.filter(p => p.status === 'pending').length,
      overdue: payments.filter(p => p.status === 'overdue').length
    }
  };

  // Generate month options
  const monthOptions = [];
  const today = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const value = date.toISOString().slice(0, 7);
    const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    monthOptions.push({ value, label });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Rent Tracking</h1>
          <p className="text-sm text-muted-foreground">Manage rent payments and track dues</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Payment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Expected</p>
            <p className="text-2xl font-semibold text-foreground">₹{stats.total.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground/80">{stats.count.total} payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Collected</p>
            <p className="text-2xl font-semibold text-green-600">₹{stats.paid.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground/80">{stats.count.paid} paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-semibold text-amber-500">₹{stats.pending.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground/80">{stats.count.pending} pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-2xl font-semibold text-destructive">₹{stats.overdue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground/80">{stats.count.overdue} overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-0">
            <TabsList>
              <TabsTrigger value="all">All ({stats.count.total})</TabsTrigger>
              <TabsTrigger value="paid">Paid ({stats.count.paid})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.count.pending})</TabsTrigger>
              <TabsTrigger value="overdue">Overdue ({stats.count.overdue})</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Due Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8">
                        <div className="flex justify-center">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      </td>
                    </tr>
                  ) : paginatedPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    paginatedPayments.map((payment) => (
                      <tr key={payment.id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-primary-foreground font-medium text-sm">
                                {payment.student?.first_name?.[0] || '?'}{payment.student?.last_name?.[0] || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {payment.student?.first_name} {payment.student?.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Room {payment.room?.room_number}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">₹{payment.amount.toLocaleString()}</p>
                          {payment.paid_date && (
                            <p className="text-xs text-green-600">
                              Paid on {format(parseISO(payment.paid_date), 'MMM d, yyyy')}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-foreground">
                            {format(parseISO(payment.due_date), 'MMM d, yyyy')}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openViewDialog(payment)}>
                                <DollarSign className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {payment.status !== 'paid' && (
                                <DropdownMenuItem onClick={() => openMarkPaidDialog(payment)}>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Mark as Paid
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Tabs>
      </Card>

      {/* Add Payment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Record</DialogTitle>
            <DialogDescription>Create a new rent payment record</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Student *</Label>
              <Select
                value={formData.student_id}
                onValueChange={handleStudentChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.filter(s => s.status === 'active').map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name} ({student.student_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Room</Label>
              <Select
                value={formData.room_id}
                onValueChange={(v) => setFormData({ ...formData, room_id: v })}
                disabled={!formData.student_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.room_number} - {room.building?.name} (₹{room.monthly_rent})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (₹) *</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                  placeholder="5000"
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="font-bold text-muted-foreground" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              onClick={handleAddPayment}
              disabled={!formData.student_id || !formData.due_date || formData.amount <= 0}
            >
              Add Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Paid Dialog */}
      <Dialog open={isMarkPaidDialogOpen} onOpenChange={setIsMarkPaidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Payment as Paid</DialogTitle>
            <DialogDescription>
              Record payment for {selectedPayment?.student?.first_name} {selectedPayment?.student?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg border border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount Due:</span>
                <span className="text-xl font-semibold text-foreground">
                  ₹{selectedPayment?.amount.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Date *</Label>
              <Input
                type="date"
                value={markPaidData.paid_date}
                onChange={(e) => setMarkPaidData({ ...markPaidData, paid_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method *</Label>
              <Select
                value={markPaidData.payment_method}
                onValueChange={(v) => setMarkPaidData({ ...markPaidData, payment_method: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Transaction ID</Label>
              <Input
                value={markPaidData.transaction_id}
                onChange={(e) => setMarkPaidData({ ...markPaidData, transaction_id: e.target.value })}
                placeholder="Optional transaction reference"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMarkPaidDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleMarkAsPaid}
              disabled={!markPaidData.paid_date || !markPaidData.payment_method}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Payment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    ₹{selectedPayment.amount.toLocaleString()}
                  </h3>
                  {getStatusBadge(selectedPayment.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground/60 uppercase font-black tracking-widest">Student</p>
                    <p className="text-sm text-foreground font-medium">
                      {selectedPayment.student?.first_name} {selectedPayment.student?.last_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground/60 uppercase font-black tracking-widest">Email</p>
                    <p className="text-sm text-foreground font-medium">{selectedPayment.student?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground/60 uppercase font-black tracking-widest">Due Date</p>
                    <p className="text-sm text-foreground font-medium">
                      {format(parseISO(selectedPayment.due_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                {selectedPayment.paid_date && (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#34a853]" />
                    <div>
                      <p className="text-xs text-muted-foreground/60 uppercase font-black tracking-widest">Paid Date</p>
                      <p className="text-sm text-green-500 font-bold">
                        {format(parseISO(selectedPayment.paid_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
                {selectedPayment.payment_method && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground/60 uppercase font-black tracking-widest">Payment Method</p>
                      <p className="text-sm text-foreground font-medium">{selectedPayment.payment_method}</p>
                    </div>
                  </div>
                )}
                {selectedPayment.transaction_id && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground/60 uppercase font-black tracking-widest">Transaction ID</p>
                      <p className="text-sm text-foreground font-medium">{selectedPayment.transaction_id}</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedPayment.notes && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground/60 uppercase font-black tracking-widest mb-1">Notes</p>
                  <p className="text-sm text-foreground font-medium">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
