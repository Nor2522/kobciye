import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Users, GraduationCap, Settings,
  LogOut, ChevronLeft, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminCourses } from '@/components/admin/AdminCourses';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminEnrollments } from '@/components/admin/AdminEnrollments';

type TabType = 'overview' | 'courses' | 'users' | 'enrollments';

export default function Admin() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeTab = (searchParams.get('tab') as TabType) || 'overview';

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin()) {
        toast({
          title: language === 'en' ? 'Access Denied' : 'Mamnuuc',
          description: language === 'en' 
            ? 'You do not have permission to access the admin panel.'
            : 'Ma haysatid ogolaanshaha maamulka.',
          variant: 'destructive',
        });
        navigate('/dashboard');
      }
    }
  }, [user, authLoading, roleLoading, isAdmin, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const setActiveTab = (tab: TabType) => {
    setSearchParams({ tab });
    setSidebarOpen(false);
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {language === 'en' ? 'Loading admin panel...' : 'Waxaa la soo gelayaa maamulka...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin()) return null;

  const navItems = [
    { id: 'overview' as TabType, label: language === 'en' ? 'Overview' : 'Guud ahaan', icon: LayoutDashboard },
    { id: 'courses' as TabType, label: language === 'en' ? 'Courses' : 'Koorsooyin', icon: BookOpen },
    { id: 'users' as TabType, label: language === 'en' ? 'Users' : 'Isticmaalayaasha', icon: Users },
    { id: 'enrollments' as TabType, label: language === 'en' ? 'Enrollments' : 'Diiwaangelinta', icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-secondary/20 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <span className="text-xl font-bold text-sidebar-primary-foreground">K</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">Kobciye</h1>
                <p className="text-xs text-sidebar-foreground/70">
                  {language === 'en' ? 'Admin Panel' : 'Maamulka'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <Separator className="bg-sidebar-border" />

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-11 font-medium",
                  activeTab === item.id 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Button>
            ))}
          </nav>

          <Separator className="bg-sidebar-border" />

          {/* Footer */}
          <div className="p-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
              onClick={() => navigate('/dashboard')}
            >
              <ChevronLeft className="w-5 h-5" />
              {language === 'en' ? 'Back to Dashboard' : 'Dib ugu noqo'}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5" />
              {language === 'en' ? 'Sign Out' : 'Ka Bax'}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold">
              {navItems.find(item => item.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Settings' : 'Qaabeynta'}
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <AdminOverview />}
            {activeTab === 'courses' && <AdminCourses />}
            {activeTab === 'users' && <AdminUsers />}
            {activeTab === 'enrollments' && <AdminEnrollments />}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
