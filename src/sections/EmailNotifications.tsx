import { useEffect, useState, useCallback } from 'react';
import {
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import {
  getEmailLogs,
  createEmailLog,
  getStudents,
  getPayments,
  getSettings
} from '@/lib/supabase';
import type { Student, Payment, EmailLog, Settings as SettingsType } from '@/types';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'reminder_before' | 'due_date' | 'overdue_after' | 'custom';
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'reminder_before',
    name: 'Rent Reminder (2 Days Before)',
    type: 'reminder_before',
    subject: 'Rent Due Reminder - {{student_name}}',
    body: `Dear {{student_name}},

This is a friendly reminder that your rent payment of ₹{{amount}} is due on {{due_date}}.

Room: {{room_number}}
Building: {{building_name}}

Please ensure timely payment to avoid any late fees.

Best regards,
Accommodation Management`
  },
  {
    id: 'due_date',
    name: 'Rent Due Today',
    type: 'due_date',
    subject: 'Rent Due Today - {{student_name}}',
    body: `Dear {{student_name}},

Your rent payment of ₹{{amount}} is due today ({{due_date}}).

Room: {{room_number}}
Building: {{building_name}}

Please make the payment at your earliest convenience.

Best regards,
Accommodation Management`
  },
  {
    id: 'overdue_after',
    name: 'Overdue Notice (2 Days After)',
    type: 'overdue_after',
    subject: 'URGENT: Overdue Rent Payment - {{student_name}}',
    body: `Dear {{student_name}},

Your rent payment of ₹{{amount}} was due on {{due_date}} and is now overdue.

Room: {{room_number}}
Building: {{building_name}}

Please make the payment immediately to avoid any penalties or further action.

Best regards,
Accommodation Management`
  }
];

export default function EmailNotifications() {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('compose');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Compose form state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Preview dialog
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewStudent, setPreviewStudent] = useState<Student | null>(null);

  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [logsData, studentsData, paymentsData, settingsData] = await Promise.all([
        getEmailLogs(),
        getStudents(),
        getPayments(),
        getSettings()
      ]);
      setEmailLogs(logsData || []);
      setStudents(studentsData || []);
      setPayments(paymentsData || []);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load email data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-generate reminders
  const generateReminders = useCallback(async () => {
    if (!settings) return;

    const today = new Date();
    const reminderBeforeDays = settings.reminder_before_days || 2;
    const reminderAfterDays = settings.reminder_after_days || 2;

    const pendingPayments = payments.filter(p => p.status === 'pending');
    const generatedEmails: { student: Student; payment: Payment; type: string }[] = [];

    for (const payment of pendingPayments) {
      const student = students.find(s => s.id === payment.student_id);
      if (!student) continue;

      const dueDate = parseISO(payment.due_date);
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const daysAfterDue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      // Before due date reminder
      if (daysUntilDue === reminderBeforeDays) {
        generatedEmails.push({ student, payment, type: 'reminder_before' });
      }
      // On due date
      else if (daysUntilDue === 0) {
        generatedEmails.push({ student, payment, type: 'due_date' });
      }
      // After due date (overdue)
      else if (daysAfterDue === reminderAfterDays) {
        generatedEmails.push({ student, payment, type: 'overdue_after' });
      }
    }

    return generatedEmails;
  }, [payments, students, settings]);

  useEffect(() => {
    generateReminders();
  }, [generateReminders]);

  const filteredLogs = emailLogs.filter(log => {
    const matchesSearch =
      log.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId === 'custom') {
      setEmailSubject('');
      setEmailBody('');
    } else {
      const template = defaultTemplates.find(t => t.id === templateId);
      if (template) {
        setEmailSubject(template.subject);
        setEmailBody(template.body);
      }
    }
  };

  const replaceTemplateVariables = (template: string, student: Student, payment?: Payment) => {
    return template
      .replace(/{{student_name}}/g, `${student.first_name} ${student.last_name}`)
      .replace(/{{student_id}}/g, student.student_id)
      .replace(/{{email}}/g, student.email)
      .replace(/{{phone}}/g, student.phone)
      .replace(/{{room_number}}/g, student.room?.room_number || 'Not assigned')
      .replace(/{{building_name}}/g, student.room?.building?.name || 'N/A')
      .replace(/{{amount}}/g, payment?.amount.toLocaleString() || '0')
      .replace(/{{due_date}}/g, payment?.due_date ? format(parseISO(payment.due_date), 'MMMM d, yyyy') : 'N/A');
  };

  const handleSendEmails = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error('Please enter subject and message');
      return;
    }

    setIsSending(true);
    let successCount = 0;
    let failCount = 0;

    for (const studentId of selectedStudents) {
      const student = students.find(s => s.id === studentId);
      if (!student) continue;

      const payment = payments.find(p => p.student_id === studentId && p.status === 'pending');

      const subject = replaceTemplateVariables(emailSubject, student, payment);
      // const body = replaceTemplateVariables(emailBody, student, payment);

      try {
        // Simulate sending email (in production, this would call your email API)
        await new Promise(resolve => setTimeout(resolve, 500));

        // Log the email
        await createEmailLog({
          recipient_email: student.email,
          recipient_name: `${student.first_name} ${student.last_name}`,
          subject,
          template_type: selectedTemplate as any,
          status: 'sent',
          sent_at: new Date().toISOString(),
          student_id: student.id
        });

        successCount++;
      } catch (error) {
        failCount++;
        await createEmailLog({
          recipient_email: student.email,
          recipient_name: `${student.first_name} ${student.last_name}`,
          subject,
          template_type: selectedTemplate as any,
          status: 'failed',
          sent_at: new Date().toISOString(),
          error_message: 'Failed to send email',
          student_id: student.id
        });
      }
    }

    setIsSending(false);
    toast.success(`Sent ${successCount} emails successfully${failCount > 0 ? `, ${failCount} failed` : ''}`);
    setSelectedStudents([]);
    fetchData();
  };

  const handlePreview = (student: Student) => {
    setPreviewStudent(student);
    setIsPreviewOpen(true);
  };

  const getPreviewContent = () => {
    if (!previewStudent) return { subject: '', body: '' };
    const payment = payments.find(p => p.student_id === previewStudent.id && p.status === 'pending');
    return {
      subject: replaceTemplateVariables(emailSubject, previewStudent, payment),
      body: replaceTemplateVariables(emailBody, previewStudent, payment)
    };
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    const studentsWithPendingRent = students.filter(s =>
      payments.some(p => p.student_id === s.id && p.status === 'pending')
    );
    setSelectedStudents(studentsWithPendingRent.map(s => s.id));
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      sent: 'bg-green-500/10 text-green-600 border-green-500/20',
      failed: 'bg-red-500/10 text-destructive border-destructive/20',
      pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    };
    const icons = {
      sent: CheckCircle2,
      failed: XCircle,
      pending: Clock
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
    total: emailLogs.length,
    sent: emailLogs.filter(l => l.status === 'sent').length,
    failed: emailLogs.filter(l => l.status === 'failed').length,
    today: emailLogs.filter(l =>
      format(parseISO(l.sent_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    ).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Email Notifications</h1>
          <p className="text-sm text-muted-foreground">Send rent reminders and manage email logs</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Sent</p>
            <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Successful</p>
            <p className="text-2xl font-semibold text-green-600">{stats.sent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Failed</p>
            <p className="text-2xl font-semibold text-destructive">{stats.failed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Sent Today</p>
            <p className="text-2xl font-semibold text-primary">{stats.today}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="compose">
            <Send className="w-4 h-4 mr-2" />
            Compose Email
          </TabsTrigger>
          <TabsTrigger value="logs">
            <FileText className="w-4 h-4 mr-2" />
            Email Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Selection */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Select Recipients</span>
                  <Badge variant="secondary">{selectedStudents.length} selected</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllStudents}
                      className="flex-1"
                    >
                      Select All with Pending Rent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStudents([])}
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    {students.filter(s => s.status === 'active').map((student) => {
                      const hasPendingRent = payments.some(p =>
                        p.student_id === student.id && p.status === 'pending'
                      );
                      return (
                        <div
                          key={student.id}
                          className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={() => toggleStudentSelection(student.id)}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                          {hasPendingRent && (
                            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                              Pending
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handlePreview(student)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Composition */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Compose Message</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Template</Label>
                    <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom Message</SelectItem>
                        {defaultTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Enter email subject..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Enter your message..."
                      rows={12}
                    />
                    <p className="text-xs text-muted-foreground">
                      Available variables: {'{{student_name}}'}, {'{{student_id}}'}, {'{{email}}'},
                      {'{{phone}}'}, {'{{room_number}}'}, {'{{building_name}}'}, {'{{amount}}'}, {'{{due_date}}'}
                    </p>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                    onClick={handleSendEmails}
                    disabled={isSending || selectedStudents.length === 0 || !emailSubject || !emailBody}
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send to {selectedStudents.length} Recipients
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background border-border"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Recipient</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Subject</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Template</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sent At</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8">
                          <div className="flex justify-center">
                            <div className="w-8 h-8 border-4 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
                          </div>
                        </td>
                      </tr>
                    ) : paginatedLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-[#5f6368]">
                          No email logs found
                        </td>
                      </tr>
                    ) : (
                      paginatedLogs.map((log) => (
                        <tr key={log.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-foreground">{log.recipient_name}</p>
                              <p className="text-xs text-muted-foreground">{log.recipient_email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground">{log.subject}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs capitalize">
                              {log.template_type.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {format(parseISO(log.sent_at), 'MMM d, yyyy HH:mm')}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(log.status)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length}
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
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              Preview for {previewStudent?.first_name} {previewStudent?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground/60 uppercase font-black tracking-widest mb-1">To:</p>
              <p className="text-sm text-foreground font-medium">{previewStudent?.email}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground/60 uppercase font-black tracking-widest mb-1">Subject:</p>
              <p className="text-sm text-foreground font-bold">{getPreviewContent().subject}</p>
            </div>
            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-xs text-muted-foreground/60 uppercase font-black tracking-widest mb-2">Message:</p>
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                {getPreviewContent().body}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
