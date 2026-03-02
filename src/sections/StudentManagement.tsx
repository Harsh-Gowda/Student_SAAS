import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  Building2,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getRooms,
  updateRoom,
  getBuildings,
  createPayment
} from '@/lib/supabase';
import type { Student, Room, Building } from '@/types';

interface StudentFormData {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  room_id: string;
  move_in_date: string;
  status: 'active' | 'inactive' | 'pending';
}

const initialFormData: StudentFormData = {
  student_id: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relation: '',
  room_id: '',
  move_in_date: '',
  status: 'active'
};

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentFormData>(initialFormData);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [roomAcFilter, setRoomAcFilter] = useState<string>('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('all');
  const [roomCategoryFilter, setRoomCategoryFilter] = useState<string>('all');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [studentsData, roomsData, buildingsData] = await Promise.all([
        getStudents({ status: statusFilter !== 'all' ? statusFilter : undefined, search: searchQuery }),
        getRooms(),
        getBuildings()
      ]);
      setStudents(studentsData || []);
      setRooms(roomsData || []);
      setBuildings(buildingsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesBuilding = buildingFilter === 'all' || student.room?.building_id === buildingFilter;

    return matchesSearch && matchesStatus && matchesBuilding;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Clean form data: convert empty strings to null for UUID/date fields
  const cleanFormData = (data: StudentFormData) => ({
    ...data,
    room_id: data.room_id || null,
    date_of_birth: data.date_of_birth || null,
    move_in_date: data.move_in_date || null,
  });

  const handleAddStudent = async () => {
    try {
      const cleaned = cleanFormData(formData);
      const newStudent = await createStudent(cleaned);

      // Mark room as occupied
      if (cleaned.room_id) {
        await updateRoom(cleaned.room_id, { status: 'occupied' });
      }

      // Auto-create first payment if a room is assigned
      if (cleaned.room_id && newStudent?.id) {
        const assignedRoom = rooms.find(r => r.id === cleaned.room_id);
        if (assignedRoom) {
          const now = new Date();
          const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 1); // 1st of next month
          try {
            await createPayment({
              student_id: newStudent.id,
              room_id: cleaned.room_id,
              amount: assignedRoom.monthly_rent || 0,
              due_date: dueDate.toISOString().split('T')[0],
              status: 'pending',
              payment_method: null,
              transaction_id: null,
              notes: 'Auto-generated on student registration'
            });
            toast.success('Rent tracking started - first payment due ' + dueDate.toLocaleDateString());
          } catch (paymentError) {
            console.error('Error creating initial payment:', paymentError);
            toast.error('Student added but rent payment could not be created. Check Rent Tracking.');
          }
        }
      }

      toast.success('Student added successfully');
      setIsAddDialogOpen(false);
      setFormData(initialFormData);
      fetchData();
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
    }
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;
    const cleaned = cleanFormData(formData);
    try {
      // Handle room status change
      const oldRoomId = selectedStudent.room_id;
      const newRoomId = cleaned.room_id;

      if (oldRoomId !== newRoomId) {
        if (oldRoomId) await updateRoom(oldRoomId, { status: 'available' });
        if (newRoomId) await updateRoom(newRoomId, { status: 'occupied' });
      }

      await updateStudent(selectedStudent.id, cleaned);
      toast.success('Student updated successfully');
      setIsEditDialogOpen(false);
      setSelectedStudent(null);
      setFormData(initialFormData);
      fetchData();
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student');
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    try {
      // Mark room as available before deleting
      if (selectedStudent.room_id) {
        await updateRoom(selectedStudent.room_id, { status: 'available' });
      }
      await deleteStudent(selectedStudent.id);
      toast.success('Student deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedStudent(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setImportPreview(jsonData.slice(0, 5));
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportStudents = async () => {
    if (!importFile) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        let successCount = 0;
        let errorCount = 0;

        for (const row of jsonData) {
          try {
            await createStudent({
              student_id: String(row.student_id || row['Student ID'] || ''),
              first_name: String(row.first_name || row['First Name'] || ''),
              last_name: String(row.last_name || row['Last Name'] || ''),
              email: String(row.email || row['Email'] || ''),
              phone: String(row.phone || row['Phone'] || ''),
              date_of_birth: row.date_of_birth || row['Date of Birth'] || null,
              emergency_contact_name: String(row.emergency_contact_name || row['Emergency Contact Name'] || ''),
              emergency_contact_phone: String(row.emergency_contact_phone || row['Emergency Contact Phone'] || ''),
              emergency_contact_relation: String(row.emergency_contact_relation || row['Emergency Contact Relation'] || ''),
              room_id: row.room_id || row['Room ID'] || null,
              move_in_date: row.move_in_date || row['Move-in Date'] || null,
              status: (row.status || row['Status'] || 'active').toLowerCase()
            });
            successCount++;
          } catch (error) {
            errorCount++;
          }
        }

        toast.success(`Imported ${successCount} students successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
        setIsImportDialogOpen(false);
        setImportFile(null);
        setImportPreview([]);
        fetchData();
      };
      reader.readAsArrayBuffer(importFile);
    } catch (error) {
      toast.error('Failed to import students');
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Student ID': 'STU001',
        'First Name': 'John',
        'Last Name': 'Doe',
        'Email': 'john.doe@example.com',
        'Phone': '+91 9876543210',
        'Date of Birth': '2000-01-01',
        'Emergency Contact Name': 'Jane Doe',
        'Emergency Contact Phone': '+91 9876543211',
        'Emergency Contact Relation': 'Parent',
        'Room ID': '',
        'Move-in Date': '2024-01-01',
        'Status': 'active'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students Template');
    XLSX.writeFile(wb, 'students_import_template.xlsx');
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    // Set building from the student's room
    const studentRoom = rooms.find(r => r.id === student.room_id);
    setSelectedBuildingId(studentRoom?.building_id || '');
    setFormData({
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      phone: student.phone,
      date_of_birth: student.date_of_birth || '',
      emergency_contact_name: student.emergency_contact_name,
      emergency_contact_phone: student.emergency_contact_phone,
      emergency_contact_relation: student.emergency_contact_relation,
      room_id: student.room_id || '',
      move_in_date: student.move_in_date || '',
      status: student.status
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/10 text-green-600 border-green-500/20',
      inactive: 'bg-destructive/10 text-destructive border-destructive/20',
      pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    };
    return (
      <Badge variant="outline" className={cn("font-bold", styles[status as keyof typeof styles] || styles.pending)}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const availableRooms = rooms.filter(room =>
    room.status !== 'maintenance' || room.id === formData.room_id
  );

  // Filter rooms by selected building and room filters
  const filteredRoomsByBuilding = selectedBuildingId
    ? availableRooms.filter(room => {
      if (room.building_id !== selectedBuildingId) return false;
      if (roomAcFilter !== 'all') {
        if (roomAcFilter === 'ac' && !room.has_ac) return false;
        if (roomAcFilter === 'non-ac' && room.has_ac) return false;
      }
      if (roomTypeFilter !== 'all' && room.room_type !== roomTypeFilter) return false;
      if (roomCategoryFilter !== 'all' && room.room_category !== roomCategoryFilter) return false;
      return true;
    })
    : [];

  const resetRoomFilters = () => {
    setRoomAcFilter('all');
    setRoomTypeFilter('all');
    setRoomCategoryFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Student Management</h1>
          <p className="text-sm text-muted-foreground">Manage student profiles and room assignments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => { setSelectedBuildingId(''); setFormData(initialFormData); setIsAddDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={buildingFilter} onValueChange={setBuildingFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Building" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buildings</SelectItem>
                {buildings.map((building) => (
                  <SelectItem key={building.id} value={building.id}>
                    {building.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Account</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Room</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No students found
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((student) => (
                    <tr key={student.id} className="border-b border-border hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-bold text-sm">
                              {student.first_name[0]}{student.last_name[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{student.first_name} {student.last_name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{student.student_id}</td>
                      <td className="py-3 px-4">
                        {student.user_id ? (
                          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-normal">Linked</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground/60 border-border font-normal">Invited</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {student.room ? (
                          <div>
                            <span>Room {student.room.room_number}</span>
                            <span className="text-xs block text-muted-foreground/80">
                              {student.room.building?.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/80">Not assigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(student.status)}</td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openViewDialog(student)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(student)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(student)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length}
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

      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>Enter student details below</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
              <TabsTrigger value="assignment">Assignment</TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Student ID *</Label>
                  <Input
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    placeholder="STU001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="emergency" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Emergency Contact Name</Label>
                  <Input
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Emergency Contact Phone</Label>
                  <Input
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    placeholder="+91 9876543211"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Input
                    value={formData.emergency_contact_relation}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                    placeholder="Parent"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="assignment" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Building *</Label>
                  <Select
                    value={selectedBuildingId}
                    onValueChange={(v) => {
                      setSelectedBuildingId(v);
                      setFormData({ ...formData, room_id: '' });
                      resetRoomFilters();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a building" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.map((building) => (
                        <SelectItem key={building.id} value={building.id}>
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedBuildingId && (
                  <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                    <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={roomAcFilter} onValueChange={setRoomAcFilter}>
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue placeholder="AC" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="ac">AC</SelectItem>
                        <SelectItem value="non-ac">Non-AC</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={roomCategoryFilter} onValueChange={setRoomCategoryFilter}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                        <SelectItem value="semi-luxury">Semi-Luxury</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground self-center ml-1">
                      {filteredRoomsByBuilding.length} room(s) found
                    </span>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Select Room</Label>
                  <Select
                    value={formData.room_id || 'none'}
                    onValueChange={(v) => setFormData({ ...formData, room_id: v === 'none' ? '' : v })}
                    disabled={!selectedBuildingId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedBuildingId ? "Select a room" : "Select a building first"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Room</SelectItem>
                      {filteredRoomsByBuilding.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          Room {room.room_number} • {room.room_type === 'single' ? 'Single' : 'Double'} • {room.has_ac ? 'AC' : 'Non-AC'}{room.room_category && room.room_category !== 'standard' ? ` • ${room.room_category === 'luxury' ? 'Luxury' : 'Semi-Luxury'}` : ''} • Floor {room.floor || '?'} — ₹{(room.monthly_rent || 0).toLocaleString()}/mo
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Move-in Date</Label>
                  <Input
                    type="date"
                    value={formData.move_in_date}
                    onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              onClick={handleAddStudent}
              disabled={!formData.student_id || !formData.first_name || !formData.last_name || !formData.email || !formData.phone}
            >
              Add Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
              <TabsTrigger value="assignment">Assignment</TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Student ID *</Label>
                  <Input
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="emergency" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Emergency Contact Name</Label>
                  <Input
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Emergency Contact Phone</Label>
                  <Input
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Input
                    value={formData.emergency_contact_relation}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="assignment" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Building *</Label>
                  <Select
                    value={selectedBuildingId}
                    onValueChange={(v) => {
                      setSelectedBuildingId(v);
                      setFormData({ ...formData, room_id: '' });
                      resetRoomFilters();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a building" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.map((building) => (
                        <SelectItem key={building.id} value={building.id}>
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedBuildingId && (
                  <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                    <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={roomAcFilter} onValueChange={setRoomAcFilter}>
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue placeholder="AC" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="ac">AC</SelectItem>
                        <SelectItem value="non-ac">Non-AC</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={roomCategoryFilter} onValueChange={setRoomCategoryFilter}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                        <SelectItem value="semi-luxury">Semi-Luxury</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground self-center ml-1">
                      {filteredRoomsByBuilding.length} room(s) found
                    </span>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Select Room</Label>
                  <Select
                    value={formData.room_id || 'none'}
                    onValueChange={(v) => setFormData({ ...formData, room_id: v === 'none' ? '' : v })}
                    disabled={!selectedBuildingId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedBuildingId ? "Select a room" : "Select a building first"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Room</SelectItem>
                      {filteredRoomsByBuilding.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          Room {room.room_number} • {room.room_type === 'single' ? 'Single' : 'Double'} • {room.has_ac ? 'AC' : 'Non-AC'}{room.room_category && room.room_category !== 'standard' ? ` • ${room.room_category === 'luxury' ? 'Luxury' : 'Semi-Luxury'}` : ''} • Floor {room.floor || '?'} — ₹{(room.monthly_rent || 0).toLocaleString()}/mo
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Move-in Date</Label>
                  <Input
                    type="date"
                    value={formData.move_in_date}
                    onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              onClick={handleUpdateStudent}
            >
              Update Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Student Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">
                    {selectedStudent.first_name[0]}{selectedStudent.last_name[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </h3>
                  <p className="text-muted-foreground font-medium">{selectedStudent.student_id}</p>
                  {getStatusBadge(selectedStudent.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground/60 uppercase font-black tracking-widest">Email</p>
                    <p className="text-sm text-foreground font-medium">{selectedStudent.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground/60 uppercase font-black tracking-widest">Phone</p>
                    <p className="text-sm text-foreground font-medium">{selectedStudent.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground/60 uppercase font-black tracking-widest">Date of Birth</p>
                    <p className="text-sm text-foreground font-medium">
                      {selectedStudent.date_of_birth || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground/60 uppercase font-black tracking-widest">Room</p>
                    <p className="text-sm text-foreground font-medium">
                      {selectedStudent.room ? `Room ${selectedStudent.room.room_number}` : 'Not assigned'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-bold text-foreground mb-3 text-sm uppercase tracking-widest">Emergency Contact</h4>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">
                    <span className="text-muted-foreground/60 mr-1">Name:</span> {selectedStudent.emergency_contact_name || 'Not provided'}
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">
                    <span className="text-muted-foreground/60 mr-1">Phone:</span> {selectedStudent.emergency_contact_phone || 'Not provided'}
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">
                    <span className="text-muted-foreground/60 mr-1">Relationship:</span> {selectedStudent.emergency_contact_relation || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedStudent?.first_name} {selectedStudent?.last_name}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteStudent}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Students from Excel</DialogTitle>
            <DialogDescription>
              Upload an Excel file with student data. Download the template for the correct format.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button variant="outline" onClick={downloadTemplate} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/30">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-upload"
              />
              <label htmlFor="excel-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-sm text-muted-foreground font-medium">
                  {importFile ? importFile.name : 'Click to upload Excel file'}
                </p>
              </label>
            </div>

            {importPreview.length > 0 && (
              <div className="border border-border rounded-lg p-4 bg-card">
                <p className="text-sm font-bold text-foreground mb-2">Preview (first 5 rows):</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        {Object.keys(importPreview[0]).map((key) => (
                          <th key={key} className="text-left py-2 px-2">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((row, i) => (
                        <tr key={i} className="border-b border-border">
                          {Object.values(row).map((val: any, j) => (
                            <td key={j} className="py-2 px-2">{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsImportDialogOpen(false);
              setImportFile(null);
              setImportPreview([]);
            }}>Cancel</Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              onClick={handleImportStudents}
              disabled={!importFile}
            >
              Import Students
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
