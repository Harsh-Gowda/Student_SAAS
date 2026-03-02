import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  DoorOpen,
  CreditCard,
  Mail,
  Settings,
  Menu,
  LogOut,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Toaster } from 'sonner';

// Sections
import Dashboard from '@/sections/Dashboard';
import StudentManagement from '@/sections/StudentManagement';
import RoomManagement from '@/sections/RoomManagement';
import RentTracking from '@/sections/RentTracking';
import EmailNotifications from '@/sections/EmailNotifications';
import SettingsPage from '@/sections/Settings';
import StudentPortal from '@/sections/StudentPortal/StudentPortal';
import StaffManagement from '@/sections/StaffManagement';
import { useAuth } from '@/contexts/AuthContext';
import Auth from '@/sections/Auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { dummyPayments } from '@/lib/dummyData';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
  { name: 'Students', icon: Users, id: 'students' },
  { name: 'Rooms', icon: DoorOpen, id: 'rooms' },
  { name: 'Rent Tracking', icon: CreditCard, id: 'rent' },
  { name: 'Email Notifications', icon: Mail, id: 'emails' },
  { name: 'Staff Management', icon: ShieldCheck, id: 'staff' },
  { name: 'Settings', icon: Settings, id: 'settings' },
];

function App() {
  const { user, role, loading, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [stats, setStats] = useState({
    overduePayments: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    // Calculate stats from dummy data
    const overdue = dummyPayments.filter(p => p.status === 'overdue').length;
    const pending = dummyPayments.filter(p => p.status === 'pending').length;
    setStats({
      overduePayments: overdue,
      pendingPayments: pending
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="w-12 h-12 border-4 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Auth Routes
  if (!user) {
    return (
      <Routes>
        <Route path="/admin/login" element={<Auth initialRole="admin" />} />
        <Route path="/student/login" element={<Auth initialRole="student" />} />
        <Route path="*" element={<Navigate to="/student/login" replace />} />
      </Routes>
    );
  }

  // Role-based redirects for root or wrong login paths
  if (user && (location.pathname === '/admin/login' || location.pathname === '/student/login' || location.pathname === '/')) {
    return <Navigate to="/dashboard" replace />;
  }

  if (role === 'student') {
    return <StudentPortal onLogout={signOut} />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <StudentManagement />;
      case 'rooms':
        return <RoomManagement />;
      case 'rent':
        return <RentTracking />;
      case 'emails':
        return <EmailNotifications />;
      case 'settings':
        return <SettingsPage />;
      case 'staff':
        return <StaffManagement />;
      default:
        return <Dashboard />;
    }
  };

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = activeSection === item.id;
    const Icon = item.icon;

    return (
      <button
        onClick={() => {
          setActiveSection(item.id);
          setIsMobileMenuOpen(false);
        }}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
          ${isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }
        `}
      >
        <Icon className="w-5 h-5" />
        <span className="flex-1 text-left">{item.name}</span>
        {item.id === 'rent' && stats.overduePayments > 0 && (
          <Badge variant="destructive" className="text-xs">
            {stats.overduePayments}
          </Badge>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      <Toaster position="top-right" richColors />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border fixed h-full transition-colors duration-300">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground text-sm uppercase tracking-tight">Accommodation</h1>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Management System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            // Show staff management to CEOs or anyone with admin role
            if (item.id === 'staff' && user?.user_metadata?.is_ceo !== true && user?.user_metadata?.role !== 'admin') return null;
            return <NavItem key={item.id} item={item} />;
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          <div className="flex items-center gap-3 px-3 py-2 bg-muted/30 rounded-xl">
            <Avatar className="w-8 h-8 border border-border">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {user.email?.[0].toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user.user_metadata?.first_name ? `${user.user_metadata.first_name}` : 'Admin'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate font-medium uppercase tracking-wider">{user.user_metadata?.role || 'Staff'}</p>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={signOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-card border-b border-border z-50">
        <div className="flex items-center justify-between p-4 px-6 h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-sm uppercase tracking-tight">Accommodation Manager</span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0 bg-card border-l-border">
                <div className="flex flex-col h-full bg-card">
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">DASHBOARD MENU</span>
                    </div>
                  </div>
                  <nav className="flex-1 p-4 space-y-2">
                    {navigation.map((item) => (
                      <NavItem key={item.id} item={item} />
                    ))}
                    <button
                      onClick={signOut}
                      className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors uppercase tracking-widest mt-4"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Log Out</span>
                    </button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          <Routes>
            <Route path="/dashboard" element={renderSection()} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
