import { useEffect, useState } from 'react';
import {
    Building2,
    CreditCard,
    Users,
    ArrowRight,
    Info,
    CheckCircle2,
    AlertCircle,
    MapPin,
    Smartphone,
    Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { dummyStudentUser, dummyRooms, dummyPayments } from '@/lib/dummyData';
import { markPaymentAsPaid } from '@/lib/supabase';
import type { Room, Payment, Student } from '@/types';

export default function StudentDashboard() {
    const [room, setRoom] = useState<Room | null>(null);
    const [rentPayment, setRentPayment] = useState<Payment | null>(null);
    const [roommates, setRoommates] = useState<Student[]>([]);
    const [isPaying, setIsPaying] = useState(false);

    useEffect(() => {
        // Get student's room
        const studentRoom = dummyRooms.find(r => r.id === dummyStudentUser.room_id);
        setRoom(studentRoom || null);

        // Get latest rent payment
        const latestPayment = dummyPayments
            .filter(p => p.student_id === dummyStudentUser.id)
            .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())[0];
        setRentPayment(latestPayment || null);

        // Get roommates
        if (studentRoom && studentRoom.students) {
            setRoommates(studentRoom.students.filter(s => s.id !== dummyStudentUser.id));
        }
    }, []);

    const handlePayRent = async () => {
        if (!rentPayment) return;
        setIsPaying(true);
        try {
            // Simulate payment delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            await markPaymentAsPaid(rentPayment.id, {
                paid_date: new Date().toISOString().split('T')[0],
                payment_method: 'UPI',
                transaction_id: 'STUDHUB-' + Math.random().toString(36).substr(2, 9).toUpperCase()
            });

            setRentPayment(prev => prev ? { ...prev, status: 'paid' } : null);
            toast.success('Rent paid successfully!');
        } catch (error) {
            toast.error('Payment failed. Please try again.');
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 rounded-[2rem] p-8 lg:p-12 text-white shadow-xl">
                <div className="relative z-10">
                    <Badge className="bg-white/20 text-white hover:bg-white/30 border-none mb-4 backdrop-blur-md px-3 py-1">
                        Student Portal
                    </Badge>
                    <h1 className="text-3xl lg:text-5xl font-bold mb-3 tracking-tight">
                        Welcome back, {dummyStudentUser.first_name}! 👋
                    </h1>
                    <p className="text-white/80 text-lg lg:text-xl max-w-xl font-medium leading-relaxed">
                        Everything looks good today. You have no urgent notifications.
                    </p>
                </div>
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-2xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rent Card */}
                <Card className="lg:col-span-2 border-none shadow-xl shadow-border/20 rounded-[2rem] overflow-hidden group bg-card">
                    <CardHeader className="bg-muted/50 border-b border-border p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold text-foreground">Rent & Finances</CardTitle>
                                <CardDescription className="text-muted-foreground font-medium">Monthly accommodation dues</CardDescription>
                            </div>
                            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <CreditCard className="w-7 h-7" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        {rentPayment ? (
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Current Amount Due</p>
                                        <p className="text-5xl font-black text-[#202124]">₹{rentPayment.amount.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant={rentPayment.status === 'paid' ? 'default' : 'destructive'} className={`px-4 py-1.5 rounded-full text-sm font-bold ${rentPayment.status === 'paid' ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : ''}`}>
                                            {rentPayment.status === 'paid' ? (
                                                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Paid</span>
                                            ) : (
                                                <span className="flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Due: {new Date(rentPayment.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            )}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 min-w-[200px]">
                                    {rentPayment.status !== 'paid' && (
                                        <Button
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
                                            onClick={handlePayRent}
                                            disabled={isPaying}
                                        >
                                            {isPaying ? 'Processing...' : 'Pay Rent Now'}
                                        </Button>
                                    )}
                                    <Button variant="outline" className="py-6 rounded-2xl text-muted-foreground font-bold border-border">
                                        <Download className="w-5 h-5 mr-2" />
                                        Last Receipt
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500 font-medium">No active payment records found.</div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Stats/Links */}
                <div className="space-y-8">
                    <Card className="border-none shadow-xl shadow-primary/10 rounded-[2rem] bg-primary text-primary-foreground p-8">
                        <h3 className="text-xl font-bold mb-6">Support & Help</h3>
                        <div className="space-y-4">
                            <Button variant="secondary" className="w-full justify-between bg-white/10 hover:bg-white/20 text-white border-none py-6 rounded-2xl group">
                                <span className="flex items-center gap-3 font-bold"><Smartphone className="w-5 h-5 text-white/70" /> Helpline 24/7</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button variant="secondary" className="w-full justify-between bg-white/10 hover:bg-white/20 text-white border-none py-6 rounded-2xl group">
                                <span className="flex items-center gap-3 font-bold"><Info className="w-5 h-5 text-white/70" /> Community Rules</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Room and Roommates */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 border-none shadow-xl shadow-border/20 rounded-[2rem] overflow-hidden bg-card">
                    <CardHeader className="bg-muted/50 border-b border-border p-8">
                        <CardTitle className="text-2xl font-bold flex items-center gap-3 text-foreground">
                            <Building2 className="w-6 h-6 text-primary" />
                            Room {room?.room_number || '---'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Building</p>
                                <p className="font-bold text-foreground">{room?.building?.name || 'Main Campus'}</p>
                                <p className="text-sm text-muted-foreground">{room?.building?.address || '123 University Road'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted p-4 rounded-2xl border border-border">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Type</p>
                                <p className="font-bold text-foreground capitalize">{room?.room_type || 'Single'}</p>
                            </div>
                            <div className="bg-muted p-4 rounded-2xl border border-border">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Category</p>
                                <p className="font-bold text-foreground capitalize">{room?.room_category || 'Standard'}</p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <div className="flex justify-between text-sm mb-2 font-bold">
                                <span className="text-muted-foreground">Occupancy</span>
                                <span className="text-foreground">{room?.students?.length || 0} / {room?.capacity || 1}</span>
                            </div>
                            <Progress value={((room?.students?.length || 0) / (room?.capacity || 1)) * 100} className="h-3 bg-muted" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 border-none shadow-xl shadow-border/20 rounded-[2rem] overflow-hidden bg-card">
                    <CardHeader className="bg-muted/50 border-b border-border p-8">
                        <CardTitle className="text-2xl font-bold flex items-center gap-3 text-foreground">
                            <Users className="w-6 h-6 text-primary" />
                            Roommates
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        {roommates.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {roommates.map((mate) => (
                                    <div key={mate.id} className="flex items-center gap-4 p-4 rounded-2xl bg-muted border border-border group hover:bg-card hover:shadow-lg transition-all duration-300">
                                        <Avatar className="w-16 h-16 border-4 border-background shadow-sm group-hover:scale-105 transition-transform">
                                            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-bold text-xl uppercase">
                                                {mate.first_name[0]}{mate.last_name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-foreground text-lg">{mate.first_name} {mate.last_name}</h4>
                                            <p className="text-sm text-muted-foreground font-medium mb-2">{mate.email}</p>
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="bg-background border-border text-xs text-muted-foreground font-bold px-2 py-0.5">
                                                    Since {new Date(mate.move_in_date || '').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                    <Users className="w-10 h-10" />
                                </div>
                                <h4 className="text-xl font-bold text-gray-400">No roommates yet</h4>
                                <p className="text-gray-400 font-medium">You currently have the room to yourself.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
