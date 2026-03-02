import { useEffect, useState, useCallback } from 'react';
import {
  DoorOpen,
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  Snowflake,
  Users,
  Home,
  Check,
  Building2,
  Layers,
  Star,
  Minus
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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getBuildings,
  createBuilding,
  createBulkRooms
} from '@/lib/supabase';
import type { Room, Building } from '@/types';

interface FloorConfig {
  floor: number;
  rooms_per_floor: number;
  room_type: 'single' | 'double';
  has_ac: boolean;
  room_category: 'luxury' | 'semi-luxury' | 'standard';
  monthly_rent: number;
}

interface BuildingFormData {
  name: string;
  address: string;
  num_floors: number;
  floors: FloorConfig[];
}

const createDefaultFloor = (floorNum: number): FloorConfig => ({
  floor: floorNum,
  rooms_per_floor: 5,
  room_type: 'single',
  has_ac: false,
  room_category: 'standard',
  monthly_rent: 5000
});

const initialBuildingFormData: BuildingFormData = {
  name: '',
  address: '',
  num_floors: 1,
  floors: [createDefaultFloor(1)]
};

interface RoomFormData {
  building_id: string;
  room_number: string;
  room_type: 'single' | 'double';
  has_ac: boolean;
  capacity: number;
  monthly_rent: number;
  status: 'available' | 'occupied' | 'maintenance';
}

const initialFormData: RoomFormData = {
  building_id: '',
  room_number: '',
  room_type: 'single',
  has_ac: false,
  capacity: 1,
  monthly_rent: 0,
  status: 'available'
};

export default function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [acFilter, setAcFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddBuildingDialogOpen, setIsAddBuildingDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<RoomFormData>(initialFormData);
  const [buildingFormData, setBuildingFormData] = useState<BuildingFormData>(initialBuildingFormData);
  const [isCreatingBuilding, setIsCreatingBuilding] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [roomsData, buildingsData] = await Promise.all([
        getRooms(),
        getBuildings()
      ]);
      setRooms(roomsData || []);
      setBuildings(buildingsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRooms = rooms.filter(room => {
    const matchesSearch =
      room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.building?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBuilding = buildingFilter === 'all' || room.building_id === buildingFilter;
    const matchesType = typeFilter === 'all' || room.room_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesAc = acFilter === 'all' ||
      (acFilter === 'ac' && room.has_ac) ||
      (acFilter === 'non-ac' && !room.has_ac);

    return matchesSearch && matchesBuilding && matchesType && matchesStatus && matchesAc;
  });

  const handleAddRoom = async () => {
    try {
      await createRoom(formData);
      toast.success('Room added successfully');
      setIsAddDialogOpen(false);
      setFormData(initialFormData);
      fetchData();
    } catch (error) {
      console.error('Error adding room:', error);
      toast.error('Failed to add room');
    }
  };

  const handleUpdateRoom = async () => {
    if (!selectedRoom) return;
    try {
      await updateRoom(selectedRoom.id, formData);
      toast.success('Room updated successfully');
      setIsEditDialogOpen(false);
      setSelectedRoom(null);
      setFormData(initialFormData);
      fetchData();
    } catch (error) {
      console.error('Error updating room:', error);
      toast.error('Failed to update room');
    }
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;
    try {
      await deleteRoom(selectedRoom.id);
      toast.success('Room deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedRoom(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Failed to delete room');
    }
  };

  const handleFloorsChange = (numFloors: number) => {
    const clamped = Math.max(1, Math.min(50, numFloors));
    const currentFloors = buildingFormData.floors;
    let newFloors: FloorConfig[];
    if (clamped > currentFloors.length) {
      newFloors = [...currentFloors];
      for (let i = currentFloors.length + 1; i <= clamped; i++) {
        newFloors.push(createDefaultFloor(i));
      }
    } else {
      newFloors = currentFloors.slice(0, clamped);
    }
    setBuildingFormData({ ...buildingFormData, num_floors: clamped, floors: newFloors });
  };

  const updateFloorConfig = (floorIndex: number, updates: Partial<FloorConfig>) => {
    const newFloors = [...buildingFormData.floors];
    newFloors[floorIndex] = { ...newFloors[floorIndex], ...updates };
    setBuildingFormData({ ...buildingFormData, floors: newFloors });
  };

  const handleAddBuilding = async () => {
    if (!buildingFormData.name || !buildingFormData.address) {
      toast.error('Please enter building name and address');
      return;
    }
    setIsCreatingBuilding(true);
    try {
      const totalRooms = buildingFormData.floors.reduce((sum, f) => sum + f.rooms_per_floor, 0);
      const newBuilding = await createBuilding({
        name: buildingFormData.name,
        address: buildingFormData.address,
        total_rooms: totalRooms
      });

      if (newBuilding?.id) {
        const roomsToCreate: object[] = [];
        for (const floorConfig of buildingFormData.floors) {
          for (let r = 1; r <= floorConfig.rooms_per_floor; r++) {
            const roomNumber = `${floorConfig.floor}${String(r).padStart(2, '0')}`;
            roomsToCreate.push({
              building_id: newBuilding.id,
              room_number: roomNumber,
              room_type: floorConfig.room_type,
              has_ac: floorConfig.has_ac,
              capacity: floorConfig.room_type === 'single' ? 1 : 2,
              monthly_rent: floorConfig.monthly_rent,
              floor: floorConfig.floor,
              room_category: floorConfig.room_category,
              status: 'available'
            });
          }
        }
        await createBulkRooms(roomsToCreate);
        toast.success(`Building "${buildingFormData.name}" created with ${roomsToCreate.length} rooms!`);
      }

      setIsAddBuildingDialogOpen(false);
      setBuildingFormData(initialBuildingFormData);
      fetchData();
    } catch (error) {
      console.error('Error creating building:', error);
      toast.error('Failed to create building');
    } finally {
      setIsCreatingBuilding(false);
    }
  };

  const openEditDialog = (room: Room) => {
    setSelectedRoom(room);
    setFormData({
      building_id: room.building_id,
      room_number: room.room_number,
      room_type: room.room_type,
      has_ac: room.has_ac,
      capacity: room.capacity,
      monthly_rent: room.monthly_rent,
      status: room.status
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (room: Room) => {
    setSelectedRoom(room);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (room: Room) => {
    setSelectedRoom(room);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      available: 'bg-green-500/10 text-green-600 border-green-500/20',
      occupied: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      maintenance: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    };
    const labels = {
      available: 'Available',
      occupied: 'Occupied',
      maintenance: 'Maintenance'
    };
    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getOccupancyColor = (occupied: number, capacity: number) => {
    const ratio = occupied / capacity;
    if (ratio === 0) return 'bg-green-500/5 dark:bg-green-500/10';
    if (ratio < 1) return 'bg-amber-500/5 dark:bg-amber-500/10';
    return 'bg-red-500/5 dark:bg-red-500/10';
  };

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    acRooms: rooms.filter(r => r.has_ac).length,
    singleRooms: rooms.filter(r => r.room_type === 'single').length,
    doubleRooms: rooms.filter(r => r.room_type === 'double').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Room Management</h1>
          <p className="text-sm text-muted-foreground">Manage rooms, occupancy, and pricing</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => { setBuildingFormData(initialBuildingFormData); setIsAddBuildingDialogOpen(true); }}>
            <Building2 className="w-4 h-4 mr-2" />
            Add Building
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Room
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-green-600">{stats.available}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-primary">{stats.occupied}</p>
            <p className="text-xs text-muted-foreground">Occupied</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-amber-500">{stats.maintenance}</p>
            <p className="text-xs text-muted-foreground">Maintenance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-foreground">{stats.acRooms}</p>
            <p className="text-xs text-muted-foreground">AC Rooms</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-foreground">{stats.singleRooms}</p>
            <p className="text-xs text-muted-foreground">Single</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-foreground">{stats.doubleRooms}</p>
            <p className="text-xs text-muted-foreground">Double</p>
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
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                <SelectTrigger className="w-40">
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="double">Double</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={acFilter} onValueChange={setAcFilter}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="AC" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="ac">AC</SelectItem>
                  <SelectItem value="non-ac">Non-AC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <DoorOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No rooms found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room) => {
            const currentOccupancy = room.students?.length || 0;
            const occupancyColor = getOccupancyColor(currentOccupancy, room.capacity);

            return (
              <Card
                key={room.id}
                className={`hover:shadow-lg transition-all duration-200 border-border ${occupancyColor}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Room {room.room_number}</h3>
                      <p className="text-sm text-muted-foreground">{room.building?.name}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openViewDialog(room)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(room)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(room)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {room.room_type === 'single' ? 'Single' : 'Double'}
                    </Badge>
                    {room.has_ac && (
                      <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-600 border-blue-500/20">
                        <Snowflake className="w-3 h-3 mr-1" />
                        AC
                      </Badge>
                    )}
                    {room.room_category && room.room_category !== 'standard' && (
                      <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest ${room.room_category === 'luxury'
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        : 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                        }`}>
                        <Star className="w-3 h-3 mr-1" />
                        {room.room_category === 'luxury' ? 'Luxury' : 'Semi-Luxury'}
                      </Badge>
                    )}
                    {room.floor && (
                      <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-muted text-muted-foreground border-border">
                        <Layers className="w-3 h-3 mr-1" />
                        Floor {room.floor}
                      </Badge>
                    )}
                    {getStatusBadge(room.status)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Occupancy</span>
                      <span className="font-medium text-foreground">{currentOccupancy}/{room.capacity}</span>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(currentOccupancy / room.capacity) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Rent</span>
                      <span className="font-medium text-green-600">₹{room.monthly_rent.toLocaleString()}</span>
                    </div>
                  </div>

                  {room.students && room.students.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Occupants:</p>
                      <div className="flex flex-wrap gap-1">
                        {room.students.map((student) => (
                          <Badge key={student.id} variant="secondary" className="text-xs">
                            {student.first_name} {student.last_name[0]}.
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Room Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-foreground">Add New Room</DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">Enter room details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Building *</Label>
              <Select
                value={formData.building_id}
                onValueChange={(v) => setFormData({ ...formData, building_id: v })}
              >
                <SelectTrigger className="bg-background border-border rounded-xl">
                  <SelectValue placeholder="Select building" />
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
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Room Number *</Label>
              <Input
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                placeholder="101"
                className="bg-background border-border rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Room Type</Label>
                <Select
                  value={formData.room_type}
                  onValueChange={(v: 'single' | 'double') => {
                    setFormData({
                      ...formData,
                      room_type: v,
                      capacity: v === 'single' ? 1 : 2
                    });
                  }}
                >
                  <SelectTrigger className="bg-background border-border rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: any) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger className="bg-background border-border rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.has_ac}
                  onCheckedChange={(v) => setFormData({ ...formData, has_ac: v })}
                />
                <Label className="text-sm font-bold text-foreground">Air Conditioned</Label>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Capacity: {formData.capacity}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Monthly Rent (₹)</Label>
              <Input
                type="number"
                value={formData.monthly_rent}
                onChange={(e) => setFormData({ ...formData, monthly_rent: parseInt(e.target.value) || 0 })}
                placeholder="5000"
                className="bg-background border-border rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="font-bold text-muted-foreground" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
              onClick={handleAddRoom}
              disabled={!formData.building_id || !formData.room_number}
            >
              Add Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Building *</Label>
              <Select
                value={formData.building_id}
                onValueChange={(v) => setFormData({ ...formData, building_id: v })}
              >
                <SelectTrigger className="bg-background border-border rounded-xl">
                  <SelectValue placeholder="Select building" />
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
            <div className="space-y-2">
              <Label>Room Number *</Label>
              <Input
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Room Type</Label>
                <Select
                  value={formData.room_type}
                  onValueChange={(v: 'single' | 'double') => {
                    setFormData({
                      ...formData,
                      room_type: v,
                      capacity: v === 'single' ? 1 : 2
                    });
                  }}
                >
                  <SelectTrigger className="bg-background border-border rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: any) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger className="bg-background border-border rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.has_ac}
                  onCheckedChange={(v) => setFormData({ ...formData, has_ac: v })}
                />
                <Label className="text-sm font-bold text-foreground">Air Conditioned</Label>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Capacity: {formData.capacity}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Monthly Rent (₹)</Label>
              <Input
                type="number"
                value={formData.monthly_rent}
                onChange={(e) => setFormData({ ...formData, monthly_rent: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleUpdateRoom}
            >
              Update Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Room Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Room Details</DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#1a73e8] rounded-lg flex items-center justify-center">
                  <DoorOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#202124]">
                    Room {selectedRoom.room_number}
                  </h3>
                  <p className="text-[#5f6368]">{selectedRoom.building?.name}</p>
                  {getStatusBadge(selectedRoom.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-[#5f6368]" />
                  <div>
                    <p className="text-xs text-[#80868b]">Room Type</p>
                    <p className="text-sm text-[#202124] capitalize">{selectedRoom.room_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Snowflake className="w-5 h-5 text-[#5f6368]" />
                  <div>
                    <p className="text-xs text-[#80868b]">Air Conditioning</p>
                    <p className="text-sm text-[#202124]">{selectedRoom.has_ac ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#5f6368]" />
                  <div>
                    <p className="text-xs text-[#80868b]">Capacity</p>
                    <p className="text-sm text-[#202124]">{selectedRoom.capacity} persons</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#5f6368]" />
                  <div>
                    <p className="text-xs text-[#80868b]">Monthly Rent</p>
                    <p className="text-sm text-[#34a853]">₹{selectedRoom.monthly_rent.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {selectedRoom.students && selectedRoom.students.length > 0 && (
                <div className="border-t border-[#dadce0] pt-4">
                  <h4 className="font-medium text-[#202124] mb-3">Current Occupants</h4>
                  <div className="space-y-2">
                    {selectedRoom.students.map((student) => (
                      <div key={student.id} className="flex items-center gap-3 p-2 bg-[#f8f9fa] rounded-lg">
                        <div className="w-8 h-8 bg-[#1a73e8] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">
                            {student.first_name[0]}{student.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#202124]">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-xs text-[#5f6368]">{student.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Room {selectedRoom?.room_number}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteRoom}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Building Dialog */}
      <Dialog open={isAddBuildingDialogOpen} onOpenChange={setIsAddBuildingDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Building</DialogTitle>
            <DialogDescription>Configure the building and its floors — rooms will be auto-generated</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Building Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Building Name *</Label>
                <Input
                  value={buildingFormData.name}
                  onChange={(e) => setBuildingFormData({ ...buildingFormData, name: e.target.value })}
                  placeholder="Block A - Main Campus"
                />
              </div>
              <div className="space-y-2">
                <Label>Address *</Label>
                <Input
                  value={buildingFormData.address}
                  onChange={(e) => setBuildingFormData({ ...buildingFormData, address: e.target.value })}
                  placeholder="123 University Road"
                />
              </div>
            </div>

            {/* Number of Floors */}
            <div className="flex items-center gap-4">
              <Label className="whitespace-nowrap">Number of Floors:</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleFloorsChange(buildingFormData.num_floors - 1)}>
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={buildingFormData.num_floors}
                  onChange={(e) => handleFloorsChange(parseInt(e.target.value) || 1)}
                  className="w-20 text-center"
                  min={1}
                  max={50}
                />
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleFloorsChange(buildingFormData.num_floors + 1)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-sm text-[#5f6368]">
                Total rooms: {buildingFormData.floors.reduce((s, f) => s + f.rooms_per_floor, 0)}
              </span>
            </div>

            {/* Floor Configuration Table */}
            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f8f9fa] border-b">
                  <tr>
                    <th className="py-2 px-3 text-left font-medium text-[#5f6368]">Floor</th>
                    <th className="py-2 px-3 text-left font-medium text-[#5f6368]">Rooms</th>
                    <th className="py-2 px-3 text-left font-medium text-[#5f6368]">Type</th>
                    <th className="py-2 px-3 text-left font-medium text-[#5f6368]">AC</th>
                    <th className="py-2 px-3 text-left font-medium text-[#5f6368]">Category</th>
                    <th className="py-2 px-3 text-left font-medium text-[#5f6368]">Rent (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {buildingFormData.floors.map((floor, idx) => (
                    <tr key={floor.floor} className="border-b last:border-0 hover:bg-[#f8f9fa]">
                      <td className="py-2 px-3">
                        <Badge variant="outline">{floor.floor}</Badge>
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          value={floor.rooms_per_floor}
                          onChange={(e) => updateFloorConfig(idx, { rooms_per_floor: Math.max(1, parseInt(e.target.value) || 1) })}
                          className="w-16 h-8"
                          min={1}
                          max={50}
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Select value={floor.room_type} onValueChange={(v: 'single' | 'double') => updateFloorConfig(idx, { room_type: v })}>
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="double">Double</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-3">
                        <Switch
                          checked={floor.has_ac}
                          onCheckedChange={(v) => updateFloorConfig(idx, { has_ac: v })}
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Select value={floor.room_category} onValueChange={(v: 'luxury' | 'semi-luxury' | 'standard') => updateFloorConfig(idx, { room_category: v })}>
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="semi-luxury">Semi-Luxury</SelectItem>
                            <SelectItem value="luxury">Luxury</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-3">
                        <Input
                          type="number"
                          value={floor.monthly_rent}
                          onChange={(e) => updateFloorConfig(idx, { monthly_rent: parseInt(e.target.value) || 0 })}
                          className="w-24 h-8"
                          min={0}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddBuildingDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-[#1a73e8] hover:bg-[#1557b0]"
              onClick={handleAddBuilding}
              disabled={isCreatingBuilding || !buildingFormData.name || !buildingFormData.address}
            >
              {isCreatingBuilding ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Creating...</>
              ) : (
                <><Building2 className="w-4 h-4 mr-2" /> Create Building & Rooms</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
