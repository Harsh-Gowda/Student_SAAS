import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signUp, signIn } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Mail, Lock, ArrowRight, Loader2, User, Phone, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';

interface AuthProps {
    initialRole?: 'student' | 'admin';
}

export default function Auth({ initialRole }: AuthProps) {
    const { refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [role, setRole] = useState<'student' | 'admin'>(initialRole || 'student');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Handle invitation email from URL
        const params = new URLSearchParams(window.location.search);
        const emailParam = params.get('email');
        if (emailParam) {
            setFormData(prev => ({ ...prev, email: emailParam }));
        }
    }, []);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        company_name: ''
    });

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        console.log('handleAuth triggered. Mode:', authMode, 'Role:', role);
        console.log('Form data:', formData);

        try {
            if (authMode === 'register') {
                console.log('Registering user...');
                const { data, error } = await signUp(formData.email, formData.password, role, {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    phone: formData.phone,
                    company_name: role === 'admin' ? formData.company_name : undefined
                });

                console.log('SignUp result in Auth.tsx:', { data, error });

                if (error) {
                    console.error('Registration error:', error);
                    throw error;
                }

                if (role === 'admin') {
                    toast.success('Registration successful!', {
                        description: 'A verification link has been sent to ' + formData.email + '. Please check your inbox and verify your email before logging in.',
                        duration: 10000,
                    });
                } else {
                    toast.success('Registration successful!', {
                        description: 'Please log in with your credentials.',
                    });
                }
                setAuthMode('login');
                // Reset password but keep email for convenience
                setFormData(prev => ({ ...prev, password: '' }));
            } else {
                console.log('Signing in user...');
                const { data, error } = await signIn(formData.email, formData.password, role);
                console.log('SignIn result in Auth.tsx:', { data, error });
                if (error) throw error;
                toast.success('Login successful!');
                await refreshUser();
            }
        } catch (error: any) {
            console.error('Auth handler error:', error);
            if (error.message?.includes('Email not confirmed')) {
                toast.error('Your email is not verified. Please check your inbox or use the resend button.', {
                    duration: 10000
                });
            } else {
                toast.error(error.message || 'Authentication failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-background font-sans overflow-hidden text-foreground">
            {/* Theme Toggle for Auth Page */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* Left Side: Branding & Graphics (Hidden on mobile) */}
            <div className={`hidden lg:flex flex-1 relative bg-primary flex-col items-center justify-center p-12 overflow-hidden transition-all duration-1000 transform ${isMounted ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Abstract Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] border-[40px] border-white rounded-full" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] border-[60px] border-white rounded-full" />
                </div>

                <div className="relative z-10 max-w-xl text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 mb-8 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 scale-100 hover:scale-105 transition-transform duration-300 cursor-default">
                        <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse" />
                        <span className="text-white text-xs font-bold tracking-widest uppercase">Trusted by 500+ Universities</span>
                    </div>

                    <h2 className="text-5xl font-black text-white leading-tight mb-6">
                        Start Managing <br />
                        <span className="text-teal-300 underline decoration-teal-500/30 underline-offset-8">Smartly</span> Today
                    </h2>

                    <p className="text-teal-50/80 text-lg mb-12 font-medium leading-relaxed">
                        From automated bookings to seamless rent tracking, we turn your property management into a breeze.
                    </p>

                    {/* Feature Cards Grid (Visual Graphic) */}
                    <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
                        <div className="bg-white/10 border border-white/20 p-6 rounded-2xl backdrop-blur-xl transform hover:-translate-y-1 transition-all duration-300 group">
                            <ShieldCheck className="w-8 h-8 text-teal-300 mb-4 group-hover:scale-110 transition-transform" />
                            <h4 className="text-white font-bold mb-1 uppercase text-xs tracking-wider border-b border-teal-500/30 pb-1 inline-block">Secure Data</h4>
                            <p className="text-teal-100/60 text-[10px] leading-normal font-medium">Bank-grade encryption for all resident records.</p>
                        </div>
                        <div className="bg-white/10 border border-white/20 p-6 rounded-2xl backdrop-blur-xl transform hover:-translate-y-1 transition-all duration-300 group">
                            <Zap className="w-8 h-8 text-teal-300 mb-4 group-hover:scale-110 transition-transform" />
                            <h4 className="text-white font-bold mb-1 uppercase text-xs tracking-wider border-b border-teal-500/30 pb-1 inline-block">Instant Sync</h4>
                            <p className="text-teal-100/60 text-[10px] leading-normal font-medium">Real-time updates across all admin devices.</p>
                        </div>
                        <div className="bg-white/10 border border-white/20 p-6 rounded-2xl backdrop-blur-xl transform hover:-translate-y-1 transition-all duration-300 lg:col-span-2">
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#0d5c63] bg-teal-${200 + i * 100} flex items-center justify-center text-[10px] font-bold text-teal-900 shadow-xl`}>U{i}</div>
                                    ))}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-0.5 uppercase text-xs tracking-wider">Active Community</h4>
                                    <p className="text-teal-100/60 text-[10px] font-medium">Join thousands of managers worldwide.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-12 left-12 flex items-center gap-3 opacity-50 select-none">
                    <Building2 className="w-5 h-5 text-white" />
                    <span className="text-white font-semibold text-[10px] tracking-[0.2em] uppercase">Accommodation Manager © 2024</span>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className={`flex-1 flex flex-col items-center justify-center p-8 bg-background transition-all duration-1000 transform ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                <div className="w-full max-w-md">
                    {/* Header for Mobile only / Brand identity */}
                    <div className="text-center lg:text-left mb-10">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl shadow-xl shadow-primary/20 mb-6 group lg:rotate-3 lg:hover:rotate-0 transition-transform duration-500">
                            <Building2 className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Create Impact</h1>
                        <p className="text-muted-foreground font-semibold text-sm">Join our community or manage your space with ease.</p>
                    </div>

                    <div className="relative">
                        <Card className="border-none lg:border-none shadow-none bg-transparent overflow-hidden">
                            <CardHeader className="space-y-6 pb-6 pt-0 px-0 translate-y-0">
                                {/* Role Switcher */}
                                {!initialRole && (
                                    <div className="bg-muted p-1 rounded-2xl flex relative z-10 border border-border shadow-inner">
                                        <button
                                            type="button"
                                            onClick={() => { setRole('student'); setAuthMode('login'); }}
                                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-widest ${role === 'student' ? 'bg-background text-primary shadow-lg' : 'text-muted-foreground hover:bg-background/50'}`}
                                        >
                                            <User className="w-3.5 h-3.5" />
                                            Student
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole('admin')}
                                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-widest ${role === 'admin' ? 'bg-background text-primary shadow-lg' : 'text-muted-foreground hover:bg-background/50'}`}
                                        >
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            Manager
                                        </button>
                                    </div>
                                )}

                                <div className="text-center lg:text-left">
                                    <CardTitle className="text-2xl font-black text-foreground flex items-center gap-3">
                                        {authMode === 'login' ? 'Sign In' : 'Join Vertex'}
                                        {authMode === 'login' && <div className="h-2 w-2 rounded-full bg-primary animate-ping" />}
                                    </CardTitle>
                                    <CardDescription className="font-bold text-muted-foreground text-sm mt-1">
                                        {authMode === 'login'
                                            ? `Access your ${role} dashboard securely.`
                                            : 'Scale your administrative impact today.'}
                                    </CardDescription>
                                </div>

                                {role === 'admin' && (
                                    <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as any)} className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 bg-muted rounded-xl p-1 border border-border shadow-inner">
                                            <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm font-black text-[10px] uppercase tracking-widest">Log In</TabsTrigger>
                                            <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm font-black text-[10px] uppercase tracking-widest">Register</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                )}
                            </CardHeader>

                            <CardContent className="px-0 pb-8">
                                <form onSubmit={handleAuth} className="space-y-6">
                                    {authMode === 'register' && (
                                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <div className="space-y-2">
                                                <Label htmlFor="first_name" className="text-foreground font-black ml-1 text-[10px] uppercase tracking-[0.15em]">First Name</Label>
                                                <Input
                                                    id="first_name"
                                                    placeholder="John"
                                                    className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground h-14 rounded-2xl focus:ring-primary/10 focus:border-primary font-bold text-sm shadow-sm"
                                                    value={formData.first_name}
                                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="last_name" className="text-foreground font-black ml-1 text-[10px] uppercase tracking-[0.15em]">Last Name</Label>
                                                <Input
                                                    id="last_name"
                                                    placeholder="Doe"
                                                    className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground h-14 rounded-2xl focus:ring-primary/10 focus:border-primary font-bold text-sm shadow-sm"
                                                    value={formData.last_name}
                                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {authMode === 'register' && role === 'admin' && (
                                        <div className="space-y-2 text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                            <Label htmlFor="company_name" className="text-foreground font-black ml-1 text-[10px] uppercase tracking-[0.15em]">Company / Organization Name</Label>
                                            <div className="relative group">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    id="company_name"
                                                    placeholder="Vertex University Accommodations"
                                                    className="pl-12 bg-muted/30 border-border text-foreground placeholder:text-muted-foreground h-14 rounded-2xl focus:ring-primary/10 focus:border-primary font-bold text-sm shadow-sm transition-all"
                                                    value={formData.company_name}
                                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2 text-left">
                                        <Label htmlFor="email" className="text-foreground font-black ml-1 text-[10px] uppercase tracking-[0.15em]">Email Address</Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="name@university.edu"
                                                className="pl-12 bg-muted/30 border-border text-foreground placeholder:text-muted-foreground h-14 rounded-2xl focus:ring-primary/10 focus:border-primary font-bold text-sm shadow-sm transition-all"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {authMode === 'register' && (
                                        <div className="space-y-2 text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                            <Label htmlFor="phone" className="text-foreground font-black ml-1 text-[10px] uppercase tracking-[0.15em]">Phone Number</Label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    id="phone"
                                                    placeholder="+91 98765 43210"
                                                    className="pl-12 bg-muted/30 border-border text-foreground placeholder:text-muted-foreground h-14 rounded-2xl focus:ring-primary/10 focus:border-primary font-bold text-sm shadow-sm transition-all"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2 text-left">
                                        <div className="flex items-center justify-between ml-1">
                                            <Label htmlFor="password" className="text-foreground font-black text-[10px] uppercase tracking-[0.15em]">{role === 'student' ? 'Student ID' : 'Password'}</Label>
                                            {authMode === 'login' && (
                                                <button type="button" className="text-[10px] text-primary hover:underline font-black uppercase tracking-widest">
                                                    Forgot?
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="password"
                                                type={role === 'student' ? 'text' : 'password'}
                                                placeholder={role === 'student' ? 'STU2024XXXX' : '••••••••'}
                                                className="pl-12 bg-muted/30 border-border text-foreground placeholder:text-muted-foreground h-14 rounded-2xl focus:ring-primary/10 focus:border-primary font-bold text-sm shadow-sm transition-all"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 rounded-2xl text-sm font-black transition-all duration-300 shadow-xl shadow-primary/20 active:scale-[0.98] mt-6 flex items-center justify-center gap-3 uppercase tracking-[0.2em]"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                {authMode === 'login' ? 'Sign In' : 'Join Now'}
                                                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>

                            {role === 'admin' && (
                                <CardFooter className="px-0 pt-0 pb-0 flex-col gap-4 justify-center">
                                    <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest text-center">
                                        {authMode === 'login' ? "New around here?" : "Already scaling?"}
                                        <button
                                            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                                            className="ml-2 text-primary hover:underline transition-all font-black"
                                        >
                                            {authMode === 'login' ? 'Create Space' : 'Sign In'}
                                        </button>
                                    </p>

                                    {authMode === 'login' && (
                                        <button
                                            onClick={async () => {
                                                if (!formData.email) {
                                                    toast.error('Please enter your email address first');
                                                    return;
                                                }
                                                const { resendVerification } = await import('@/lib/supabase');
                                                const { error } = await resendVerification(formData.email);
                                                if (error) toast.error(error.message);
                                                else toast.success('Verification email resent!');
                                            }}
                                            className="text-[10px] text-muted-foreground hover:text-primary font-bold uppercase tracking-[0.1em]"
                                        >
                                            Didn't get the email? Resend verification
                                        </button>
                                    )}
                                </CardFooter>
                            )}
                        </Card>
                    </div>

                    <div className="mt-16 text-center text-muted-foreground/30 text-[10px] font-black tracking-[0.3em] uppercase flex items-center justify-center gap-6">
                        <div className="h-px bg-border flex-1" />
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Encrypted Security</span>
                        </div>
                        <div className="h-px bg-border flex-1" />
                    </div>
                </div>
            </div>
        </div>
    );
}
