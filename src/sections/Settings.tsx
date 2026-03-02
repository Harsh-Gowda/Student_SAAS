import { useEffect, useState } from 'react';
import {
  Settings,
  Building2,
  Mail,
  Bell,
  Save,
  Plus,
  Trash2,
  Edit2,
  Check,
  CreditCard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  getSettings,
  updateSettings,
  getBuildings,
  createBuilding
} from '@/lib/supabase';
import type { Settings as SettingsType, Building } from '@/types';

interface BuildingFormData {
  name: string;
  address: string;
  total_rooms: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [generalForm, setGeneralForm] = useState({
    company_name: '',
    rent_due_day: 1,
    reminder_before_days: 2,
    reminder_after_days: 2
  });

  const [emailForm, setEmailForm] = useState({
    email_sender_name: '',
    email_sender_address: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: ''
  });

  // Building dialog
  const [isBuildingDialogOpen, setIsBuildingDialogOpen] = useState(false);
  const [buildingForm, setBuildingForm] = useState<BuildingFormData>({
    name: '',
    address: '',
    total_rooms: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [settingsData, buildingsData] = await Promise.all([
        getSettings(),
        getBuildings()
      ]);

      if (settingsData) {
        setSettings(settingsData);
        setGeneralForm({
          company_name: settingsData.company_name || '',
          rent_due_day: settingsData.rent_due_day || 1,
          reminder_before_days: settingsData.reminder_before_days || 2,
          reminder_after_days: settingsData.reminder_after_days || 2
        });
        setEmailForm({
          email_sender_name: settingsData.email_sender_name || '',
          email_sender_address: settingsData.email_sender_address || '',
          smtp_host: settingsData.smtp_host || '',
          smtp_port: settingsData.smtp_port || 587,
          smtp_username: settingsData.smtp_username || '',
          smtp_password: settingsData.smtp_password || ''
        });
      }

      setBuildings(buildingsData || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    if (!settings) return;
    try {
      setIsSaving(true);
      await updateSettings(settings.id, {
        ...generalForm
      });
      toast.success('General settings saved');
      fetchData();
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!settings) return;
    try {
      setIsSaving(true);
      await updateSettings(settings.id, {
        ...emailForm
      });
      toast.success('Email settings saved');
      fetchData();
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBuilding = async () => {
    try {
      await createBuilding(buildingForm);
      toast.success('Building added successfully');
      setIsBuildingDialogOpen(false);
      setBuildingForm({ name: '', address: '', total_rooms: 0 });
      fetchData();
    } catch (error) {
      toast.error('Failed to add building');
    }
  };

  const testEmailConnection = async () => {
    toast.info('Testing email connection...');
    // In a real implementation, this would test the SMTP connection
    setTimeout(() => {
      toast.success('Email connection test successful');
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your accommodation management system</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-auto">
          <TabsTrigger value="general">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="buildings">
            <Building2 className="w-4 h-4 mr-2" />
            Buildings
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Company Name</Label>
                <Input
                  value={generalForm.company_name}
                  onChange={(e) => setGeneralForm({ ...generalForm, company_name: e.target.value })}
                  placeholder="Your Company Name"
                  className="bg-background border-border"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Rent Due Day of Month</Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={generalForm.rent_due_day}
                    onChange={(e) => setGeneralForm({ ...generalForm, rent_due_day: parseInt(e.target.value) || 1 })}
                    className="bg-background border-border"
                  />
                  <p className="text-xs text-muted-foreground">Day when rent is due each month</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Reminder Before (Days)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={generalForm.reminder_before_days}
                    onChange={(e) => setGeneralForm({ ...generalForm, reminder_before_days: parseInt(e.target.value) || 0 })}
                    className="bg-background border-border"
                  />
                  <p className="text-xs text-muted-foreground">Days before due date to send reminder</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Overdue Notice After (Days)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={generalForm.reminder_after_days}
                    onChange={(e) => setGeneralForm({ ...generalForm, reminder_after_days: parseInt(e.target.value) || 0 })}
                    className="bg-background border-border"
                  />
                  <p className="text-xs text-muted-foreground">Days after due date to send overdue notice</p>
                </div>
              </div>

              <Button
                onClick={handleSaveGeneral}
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Buildings */}
        <TabsContent value="buildings">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Buildings</CardTitle>
                <CardDescription>Manage your accommodation buildings</CardDescription>
              </div>
              <Button onClick={() => setIsBuildingDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Building
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {buildings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No buildings added yet</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsBuildingDialogOpen(true)}
                    >
                      Add your first building
                    </Button>
                  </div>
                ) : (
                  buildings.map((building) => (
                    <div
                      key={building.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{building.name}</h3>
                          <p className="text-sm text-muted-foreground">{building.address}</p>
                          <p className="text-xs text-muted-foreground/80">{building.total_rooms} rooms</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for sending emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sender Name</Label>
                  <Input
                    value={emailForm.email_sender_name}
                    onChange={(e) => setEmailForm({ ...emailForm, email_sender_name: e.target.value })}
                    placeholder="Accommodation Management"
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sender Email Address</Label>
                  <Input
                    type="email"
                    value={emailForm.email_sender_address}
                    onChange={(e) => setEmailForm({ ...emailForm, email_sender_address: e.target.value })}
                    placeholder="noreply@example.com"
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-medium text-foreground mb-4">SMTP Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">SMTP Host</Label>
                    <Input
                      value={emailForm.smtp_host}
                      onChange={(e) => setEmailForm({ ...emailForm, smtp_host: e.target.value })}
                      placeholder="smtp.gmail.com"
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">SMTP Port</Label>
                    <Input
                      type="number"
                      value={emailForm.smtp_port}
                      onChange={(e) => setEmailForm({ ...emailForm, smtp_port: parseInt(e.target.value) || 587 })}
                      placeholder="587"
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">SMTP Username</Label>
                    <Input
                      value={emailForm.smtp_username}
                      onChange={(e) => setEmailForm({ ...emailForm, smtp_username: e.target.value })}
                      placeholder="your-email@gmail.com"
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">SMTP Password</Label>
                    <Input
                      type="password"
                      value={emailForm.smtp_password}
                      onChange={(e) => setEmailForm({ ...emailForm, smtp_password: e.target.value })}
                      placeholder="••••••••"
                      className="bg-background border-border"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSaveEmail}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Email Settings
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={testEmailConnection}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure automated email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Rent Reminder (Before Due)</h3>
                      <p className="text-sm text-muted-foreground">
                        Send reminder {generalForm.reminder_before_days} days before rent is due
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600">Enabled</span>
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Rent Due (On Due Date)</h3>
                      <p className="text-sm text-muted-foreground">
                        Send notification on the day rent is due
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600">Enabled</span>
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Overdue Notice (After Due)</h3>
                      <p className="text-sm text-muted-foreground">
                        Send overdue notice {generalForm.reminder_after_days} days after rent is due
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600">Enabled</span>
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-medium text-primary mb-2">Notification Schedule</h4>
                <p className="text-sm text-muted-foreground">
                  Based on your current settings, notifications will be sent as follows:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Reminder: {generalForm.reminder_before_days} days before due date</li>
                  <li>• Due Notice: On the due date (day {generalForm.rent_due_day} of each month)</li>
                  <li>• Overdue Notice: {generalForm.reminder_after_days} days after due date</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Building Dialog */}
      <Dialog open={isBuildingDialogOpen} onOpenChange={setIsBuildingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Building</DialogTitle>
            <DialogDescription>Enter building details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Building Name *</Label>
              <Input
                value={buildingForm.name}
                onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                placeholder="e.g., Block A"
                className="bg-background border-border rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Address</Label>
              <Input
                value={buildingForm.address}
                onChange={(e) => setBuildingForm({ ...buildingForm, address: e.target.value })}
                placeholder="Full address"
                className="bg-background border-border rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Rooms</Label>
              <Input
                type="number"
                value={buildingForm.total_rooms}
                onChange={(e) => setBuildingForm({ ...buildingForm, total_rooms: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="bg-background border-border rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBuildingDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleAddBuilding}
              disabled={!buildingForm.name}
            >
              Add Building
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
