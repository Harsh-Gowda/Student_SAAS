import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    CreditCard,
    Wrench,
    Bell,
    FileText,
    User,
    LogOut,
    Building2,
    Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Toaster } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentByUserId } from '@/lib/supabase';
import type { Student } from '@/types';
import { ThemeToggle } from '@/components/ThemeToggle';

// Student Sections
import StudentDashboard from './Dashboard';
import Maintenance from './Maintenance';
import Finances from './Finances';
import Documents from './Documents';
import Notices from './Notices';
import Profile from './Profile';

const navigation = [
    { name: 'Overview', icon: LayoutDashboard, id: 'overview' },
    { name: 'Finances', icon: CreditCard, id: 'finances' },
    { name: 'Maintenance', icon: Wrench, id: 'maintenance' },
    { name: 'Notices', icon: Bell, id: 'notices' },
    { name: 'Documents', icon: FileText, id: 'documents' },
    { name: 'Profile', icon: User, id: 'profile' },
];

interface StudentPortalProps {
    onBackToAdmin?: () => void;
    onLogout?: () => void;
}

export default function StudentPortal({ onBackToAdmin, onLogout }: StudentPortalProps) {
    const { user, signOut } = useAuth();
    const [activeSection, setActiveSection] = useState('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [studentData, setStudentData] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStudent() {
            if (user?.id) {
                try {
                    const data = await getStudentByUserId(user.id);
                    setStudentData(data);
                } catch (error) {
                    console.error('Error loading student data:', error);
                } finally {
                    setLoading(false);
                }
            }
        }
        loadStudent();
    }, [user?.id]);

    const handleLogout = async () => {
        if (onLogout) {
            onLogout();
        } else {
            await signOut();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
                <div className="w-12 h-12 border-4 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const renderSection = () => {
        switch (activeSection) {
            case 'overview':
                return <StudentDashboard />;
            case 'finances':
                return <Finances />;
            case 'maintenance':
                return <Maintenance />;
            case 'notices':
                return <Notices />;
            case 'documents':
                return <Documents />;
            case 'profile':
                return <Profile />;
            default:
                return <StudentDashboard />;
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
          w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
          ${isActive
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
        `}
            >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.name}</span>
            </button>
        );
    };

    const initials = studentData
        ? `${studentData.first_name[0]}${studentData.last_name[0]}`
        : user?.email?.[0]?.toUpperCase() || 'S';

    return (
        <div className="min-h-screen bg-background flex text-foreground transition-colors duration-300">
            <Toaster position="top-right" richColors />

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border fixed h-full z-20 transition-colors duration-300">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Building2 className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="font-bold text-foreground text-sm tracking-tight">STUDENT<span className="text-primary-foreground bg-primary px-1 rounded ml-0.5">HUB</span></h1>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none mt-0.5">Self-Service</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navigation.map((item) => (
                        <NavItem key={item.id} item={item} />
                    ))}
                </nav>

                <div className="p-4 border-t border-border space-y-4">
                    {onBackToAdmin && (
                        <Button
                            variant="outline"
                            className="w-full text-xs h-8 border-dashed hover:bg-muted"
                            onClick={onBackToAdmin}
                        >
                            Back to Admin Panel
                        </Button>
                    )}
                    <div className="flex items-center gap-3 px-2 py-2 bg-muted/30 rounded-xl">
                        <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-medium">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                                {studentData ? `${studentData.first_name}` : user?.email?.split('@')[0]}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate font-bold uppercase tracking-widest">{studentData?.student_id || 'ID'}</p>
                        </div>
                        <div className="flex items-center">
                            <ThemeToggle />
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive rounded-full h-8 w-8" onClick={handleLogout}>
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-[#dadce0] z-50 px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#1a73e8] rounded-lg flex items-center justify-center shadow-md">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-[#202124] text-sm tracking-tight uppercase">Student Hub</span>
                </div>

                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Menu className="w-6 h-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[85vw] p-0 border-l-0">
                        <div className="flex flex-col h-full bg-white">
                            <div className="p-6 border-b border-[#dadce0] bg-[#f8f9fa]/50">
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-14 h-14 border-4 border-white shadow-md">
                                        <AvatarFallback className="bg-[#1a73e8] text-white text-lg font-bold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="font-bold text-[#202124]">
                                            {studentData ? `${studentData.first_name} ${studentData.last_name}` : user?.email}
                                        </h2>
                                        <p className="text-xs text-[#5f6368]">{studentData?.student_id || 'Student'}</p>
                                    </div>
                                </div>
                            </div>
                            <nav className="flex-1 p-6 space-y-3">
                                {navigation.map((item) => (
                                    <NavItem key={item.id} item={item} />
                                ))}
                            </nav>
                            <div className="p-6 border-t border-[#dadce0] bg-[#f8f9fa]/50">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-[#ea4335] hover:bg-red-50 hover:text-red-600 rounded-xl gap-3"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen overflow-x-hidden">
                <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {renderSection()}
                </div>
            </main>
        </div>
    );
}
