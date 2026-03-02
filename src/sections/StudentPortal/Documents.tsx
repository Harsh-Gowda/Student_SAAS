import { useEffect, useState } from 'react';
import {
    FileText,
    Download,
    Search,
    FileCheck,
    ShieldCheck,
    BookOpen,
    MoreVertical,
    ExternalLink,
    Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getDocuments } from '@/lib/supabase';
import { dummyStudentUser } from '@/lib/dummyData';
import type { StudentDocument } from '@/types';

export default function Documents() {
    const [documents, setDocuments] = useState<StudentDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const data = await getDocuments(dummyStudentUser.id);
            setDocuments(data);
        } catch (error) {
            toast.error('Failed to load documents');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const filteredDocuments = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getDocIcon = (type: string) => {
        switch (type) {
            case 'lease':
                return <FileCheck className="w-8 h-8 text-primary" />;
            case 'id_proof':
                return <ShieldCheck className="w-8 h-8 text-green-600" />;
            case 'rules':
                return <BookOpen className="w-8 h-8 text-amber-500" />;
            default:
                return <FileText className="w-8 h-8 text-muted-foreground" />;
        }
    };

    const handleDownload = (name: string) => {
        toast.success('Downloading ' + name);
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Documents</h1>
                    <p className="text-muted-foreground font-medium">Access your official agreements and records</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search documents..."
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
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="border-none shadow-xl shadow-border/20 rounded-[2.5rem] bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8">
                        <CardHeader className="p-0 mb-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary-foreground">
                                <ShieldCheck className="w-6 h-6 text-primary-foreground/80" />
                                Verified Status
                            </CardTitle>
                            <CardDescription className="text-primary-foreground/80 text-sm leading-relaxed">
                                Your mandatory documents are verified.
                            </CardDescription>
                        </CardHeader>
                        <div className="flex items-center gap-2 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/10">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground">Fully Compliant</span>
                        </div>
                    </Card>

                    {filteredDocuments.map((doc) => (
                        <Card key={doc.id} className="border-none shadow-xl shadow-border/20 rounded-[2.5rem] bg-card overflow-hidden group hover:shadow-2xl transition-all duration-300 border border-border">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 bg-muted rounded-[1.5rem] flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                                        {getDocIcon(doc.type)}
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-full">
                                        <MoreVertical className="w-5 h-5" />
                                    </Button>
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1">{doc.name}</h3>
                                <div className="flex items-center gap-2 mb-6">
                                    <Badge variant="outline" className="capitalize bg-muted text-muted-foreground border-border font-bold px-3 py-1 text-[10px] uppercase tracking-wider">
                                        {doc.type.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Uploaded {new Date(doc.uploaded_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-2xl border-none h-12 gap-2"
                                        onClick={() => toast.info('Previewing ' + doc.name)}
                                    >
                                        <Eye className="w-4 h-4" />
                                        Preview
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="w-12 h-12 rounded-2xl border-border text-primary hover:bg-primary/10"
                                        onClick={() => handleDownload(doc.name)}
                                    >
                                        <Download className="w-5 h-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="bg-muted rounded-[2.5rem] p-10 border border-border/50">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-card rounded-3xl flex items-center justify-center shadow-sm border border-border">
                        <ExternalLink className="w-10 h-10 text-primary" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-bold text-foreground mb-2">Request Additional Documents</h3>
                        <p className="text-muted-foreground font-medium">Need a payment certificate, NOC, or address proof for external purposes? Request it from the administration panel.</p>
                    </div>
                    <Button className="bg-foreground text-background hover:bg-foreground/90 px-8 py-7 rounded-2xl font-bold">
                        Make Request
                    </Button>
                </div>
            </div>
        </div>
    );
}
