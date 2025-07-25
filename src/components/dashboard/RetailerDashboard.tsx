import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Store, 
  Search, 
  Users, 
  ShoppingCart, 
  History, 
  LogOut,
  TrendingUp,
  Package,
  Clock
} from 'lucide-react';

const RetailerDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { logout, userData } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const dashboardCards = [
    {
      title: t('browseSuppliers'),
      description: 'Find the best suppliers for your raw materials',
      icon: Store,
      color: 'bg-gradient-primary',
      href: '/suppliers',
    },
    {
      title: t('comparePrices'),
      description: 'Compare prices across different suppliers',
      icon: TrendingUp,
      color: 'bg-gradient-accent',
      href: '/compare',
    },
    {
      title: t('groupOrders'),
      description: 'Join or create bulk buying groups',
      icon: Users,
      color: 'bg-gradient-primary',
      href: '/group-orders',
    },
    {
      title: t('directOrders'),
      description: 'Place direct orders with suppliers',
      icon: ShoppingCart,
      color: 'bg-gradient-accent',
      href: '/cart',
    },
    {
      title: t('orderHistory'),
      description: 'View your past orders and receipts',
      icon: History,
      color: 'bg-gradient-primary',
      href: '/orders',
    },
  ];

  const quickStats = [
    {
      label: t('currentOrders'),
      value: '3',
      icon: Package,
      color: 'text-primary',
    },
    {
      label: t('activeGroupOrders'),
      value: '2',
      icon: Users,
      color: 'text-accent',
    },
    {
      label: t('pendingDeliveries'),
      value: '1',
      icon: Clock,
      color: 'text-primary-glow',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground py-6 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
            <p className="text-primary-foreground/80">
              {t('welcome')}, {userData?.email?.split('@')[0]}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('logout')}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-card/90 backdrop-blur-sm border-0 shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => (
            <Card key={index} className="group hover:shadow-elegant transition-all duration-300 bg-card/90 backdrop-blur-sm border-0 cursor-pointer">
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full group-hover:border-primary transition-all duration-300">
                  {t('view')} →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="bg-card/90 backdrop-blur-sm border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Order #1234 confirmed</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  {t('view')}
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Joined group order for Onions</p>
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  {t('view')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RetailerDashboard;