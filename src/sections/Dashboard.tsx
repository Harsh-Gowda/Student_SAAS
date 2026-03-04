import { useEffect, useState } from 'react';
import {
  Users,
  DoorOpen,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  getDashboardStats,
  getMonthlyRevenueData,
  getBuildingOccupancyData,
  getPayments,
  getStudents
} from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

interface DashboardStats {
  totalStudents: number;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  monthlyRevenue: number;
  overduePayments: number;
  pendingPayments: number;
}

interface RecentPayment {
  id: string;
  student_name: string;
  amount: number;
  status: string;
  paid_date: string;
}

interface RecentStudent {
  id: string;
  name: string;
  room_number: string;
  move_in_date: string;
}

const COLORS = ['#1a73e8', '#34a853', '#fbbc04', '#ea4335'];

export interface DashboardProps {
  onNavigate?: (id: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    occupancyRate: 0,
    monthlyRevenue: 0,
    overduePayments: 0,
    pendingPayments: 0
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch main stats
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);

      // Fetch revenue data
      const monthlyRevenue = await getMonthlyRevenueData(6);
      setRevenueData(monthlyRevenue);

      // Fetch building occupancy
      const buildingOccupancy = await getBuildingOccupancyData();
      setOccupancyData(buildingOccupancy);

      // Fetch recent payments (sorted by paid_date)
      const payments = await getPayments({ status: 'paid', order: 'paid_date' });
      const recentPays = payments?.slice(0, 5).map((p: any) => ({
        id: p.id,
        student_name: `${p.student?.first_name} ${p.student?.last_name}`,
        amount: p.amount,
        status: p.status,
        paid_date: p.paid_date
      })) || [];
      setRecentPayments(recentPays);

      // Fetch recent students
      const students = await getStudents();
      const recentStuds = students?.filter((s: any) => s.status !== 'exited').slice(0, 5).map((s: any) => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        room_number: s.room?.room_number || 'Not assigned',
        move_in_date: s.move_in_date
      })) || [];
      setRecentStudents(recentStuds);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
    color,
    onClick
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color: string;
    onClick?: () => void;
  }) => (
    <Card
      className={`hover:shadow-lg transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-semibold text-foreground">{value}</h3>
            {subtitle && <p className="text-xs text-muted-foreground/80 mt-1">{subtitle}</p>}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${trend === 'up' ? 'text-[#34a853]' : trend === 'down' ? 'text-[#ea4335]' : 'text-[#5f6368]'
                }`}>
                {trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                  trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your accommodation management</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          subtitle="Active students"
          icon={Users}
          trend="up"
          trendValue="+12% this month"
          color="#1a73e8"
          onClick={() => onNavigate?.('students')}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${stats.occupancyRate}%`}
          subtitle={`${stats.occupiedRooms} of ${stats.totalRooms} rooms occupied`}
          icon={DoorOpen}
          trend={stats.occupancyRate > 80 ? 'up' : 'neutral'}
          trendValue={stats.occupancyRate > 80 ? 'High occupancy' : 'Room for growth'}
          color="#34a853"
          onClick={() => onNavigate?.('rooms')}
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${stats.monthlyRevenue.toLocaleString()}`}
          subtitle="This month"
          icon={CreditCard}
          trend="up"
          trendValue="On track"
          color="#fbbc04"
          onClick={() => onNavigate?.('rent')}
        />
        <StatCard
          title="Overdue Payments"
          value={stats.overduePayments}
          subtitle={`${stats.pendingPayments} pending payments`}
          icon={AlertTriangle}
          trend={stats.overduePayments > 0 ? 'down' : 'up'}
          trendValue={stats.overduePayments > 0 ? 'Action needed' : 'All caught up'}
          color="#ea4335"
          onClick={() => onNavigate?.('rent')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-foreground">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#1a73e8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border border-border p-3 rounded-xl shadow-xl">
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">{label}</p>
                            {payload.map((entry: any, index: number) => (
                              <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
                                {entry.name}: ₹{entry.value?.toLocaleString()}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#1a73e8"
                    strokeWidth={4}
                    dot={{ fill: '#1a73e8', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#1a73e8' }}
                    animationDuration={1500}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Trend"
                    stroke="#f97316"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Building Occupancy */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-foreground">Building Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="occupiedRooms"
                    nameKey="buildingName"
                  >
                    {occupancyData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              {occupancyData.map((item, index) => (
                <div key={item.buildingName} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-[#5f6368]">
                    {item.buildingName} ({item.occupancyRate}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium text-foreground">Recent Payments</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPayments.length === 0 ? (
                <p className="text-sm text-[#5f6368] text-center py-8">No recent payments</p>
              ) : (
                recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#34a853] rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#202124]">{payment.student_name}</p>
                        <p className="text-xs text-[#5f6368]">
                          {payment.paid_date && format(parseISO(payment.paid_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#34a853]">
                        +₹{payment.amount.toLocaleString()}
                      </p>
                      <Badge variant="outline" className="text-xs border-[#34a853] text-[#34a853]">
                        Paid
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Students */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium text-foreground">Recent Students</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentStudents.length === 0 ? (
                <p className="text-sm text-[#5f6368] text-center py-8">No recent students</p>
              ) : (
                recentStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1a73e8] rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#202124]">{student.name}</p>
                        <p className="text-xs text-[#5f6368]">Room {student.room_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#5f6368]">Move-in</p>
                      <p className="text-sm text-[#202124]">
                        {student.move_in_date && format(parseISO(student.move_in_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-[#1a73e8] hover:bg-[#1557b0]">
              <Users className="w-4 h-4 mr-2" />
              Add Student
            </Button>
            <Button variant="outline">
              <DoorOpen className="w-4 h-4 mr-2" />
              Manage Rooms
            </Button>
            <Button variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Send Reminders
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
