import { useEffect, useState } from 'react';
import {
    Bell,
    Search,
    Calendar,
    AlertTriangle,
    Info,
    Zap,
    PartyPopper,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getNotices } from '@/lib/supabase';
import type { Notice } from '@/types';

export default function Notices() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                setIsLoading(true);
                const data = await getNotices();
                setNotices(data);
            } catch (error) {
                toast.error('Failed to load notices');
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotices();
    }, []);

    const filteredNotices = notices.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getNoticeIcon = (category: string) => {
        switch (category) {
            case 'urgent':
                return <div className="w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-destructive" /></div>;
            case 'maintenance':
                return <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center"><Zap className="w-6 h-6 text-primary" /></div>;
            case 'event':
                return <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center"><PartyPopper className="w-6 h-6 text-purple-600" /></div>;
            default:
                return <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center"><Info className="w-6 h-6 text-muted-foreground" /></div>;
        }
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'urgent':
                return <Badge className="bg-destructive hover:bg-destructive/90 border-none font-bold rounded-full px-3 py-0.5 text-[10px] uppercase tracking-wider">Urgent</Badge>;
            case 'maintenance':
                return <Badge className="bg-primary hover:bg-primary/90 border-none font-bold rounded-full px-3 py-0.5 text-[10px] uppercase tracking-wider">Maintenance</Badge>;
            case 'event':
                return <Badge className="bg-purple-600 hover:bg-purple-700 border-none font-bold rounded-full px-3 py-0.5 text-[10px] uppercase tracking-wider">Event</Badge>;
            default:
                return <Badge className="bg-muted-foreground hover:bg-muted-foreground/90 border-none font-bold rounded-full px-3 py-0.5 text-[10px] uppercase tracking-wider text-muted">General</Badge>;
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Notice Board</h1>
                    <p className="text-muted-foreground font-medium">Important updates and announcements from management</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search notices..."
                        className="pl-12 py-7 rounded-2xl border-none shadow-xl shadow-border/20 min-w-[280px] bg-card text-foreground"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredNotices.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-[2.5rem] shadow-xl shadow-border/20 border border-border">
                    <Bell className="w-16 h-16 text-muted/20 mx-auto mb-4" />
                    <p className="text-muted-foreground font-bold">No announcements at the moment</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredNotices.map((notice) => (
                        <Card key={notice.id} className="border-none shadow-xl shadow-border/20 rounded-[2.5rem] bg-card overflow-hidden group hover:shadow-2xl transition-all duration-300 border border-border">
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-shrink-0">
                                        {getNoticeIcon(notice.category)}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            {getCategoryBadge(notice.category)}
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(notice.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{notice.title}</h2>
                                        <p className="text-muted-foreground font-medium leading-relaxed max-w-4xl">
                                            {notice.content}
                                        </p>
                                    </div>
                                    <div className="flex md:flex-col justify-end gap-3 min-w-[120px]">
                                        <Button variant="ghost" className="rounded-xl font-bold text-primary hover:bg-primary/10 group/btn" asChild>
                                            <a href={`#notice-${notice.id}`}>
                                                View Details
                                                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
