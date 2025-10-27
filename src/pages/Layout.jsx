

import React, { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Bell, LogOut, Settings, User as UserIcon, LayoutDashboard, MessageSquare, BarChart3, CalendarDays, Shield, Star, GraduationCap, Sparkles, Users, Wallet, Crown, ChevronDown, Edit3, LogIn } from "lucide-react";
import { User, Subscription } from "@/api/entities";
import RealtimeNotificationBell from "@/components/notifications/RealtimeNotificationBell";
import { EntityConfigProvider } from "@/components/context/EntityConfigProvider";
import { SubscriptionProvider } from "@/components/context/SubscriptionProvider";

function InnerLayout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);

  const isPublicPage = ['/contact', '/Login', '/Signup'].includes(location.pathname);
  
  // Check if this is the SuperAdmin page - if yes, render without layout wrapper
  const isSuperAdminPage = location.pathname === createPageUrl('SuperAdmin') || currentPageName === 'SuperAdmin';

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const currentUser = await User.me().catch(() => null);
        
        if (!isMounted) return;
        
        if (currentUser) {
          setUser(currentUser);
          setIsGuestMode(false);
          
          // Check subscription status
          if (!['admin', 'super_admin'].includes(currentUser.app_role)) {
            try {
              const subs = await Subscription.filter({ 
                user_id: currentUser.id, 
                status: 'active' 
              }).catch(() => []);
              
              if (isMounted) {
                setIsSubscribed(subs.length > 0);
              }
            } catch (error) {
              if (isMounted && error.message !== 'Request aborted') {
                console.log("No active subscription");
                setIsSubscribed(false);
              }
            }
          } else {
            // Admins always have access
            if (isMounted) {
              setIsSubscribed(true);
            }
          }
        } else {
          // No user logged in - enable guest mode
          if (isMounted) {
            setUser(null);
            setIsSubscribed(false);
            setIsGuestMode(true);
          }
        }
      } catch (error) {
        if (isMounted && error.message !== 'Request aborted') {
          console.log("User not authenticated - enabling guest mode");
          setUser(null);
          setIsSubscribed(false);
          setIsGuestMode(true);
        }
      } finally {
        if (isMounted) {
          setIsAuthCheckComplete(true);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await User.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const displayNavigationItems = useMemo(() => {
    if (!isAuthCheckComplete) {
        return [];
    }

    // ✅ HARDCODED ORDER - Fixed sequence
    const hardcodedOrder = [
      { key: 'dashboard', title: 'Dashboard', url: createPageUrl('Dashboard'), icon: LayoutDashboard, badge: null },
      { key: 'my_portfolio', title: 'My Portfolio', url: createPageUrl('MyPortfolio'), icon: Wallet, badge: null },
      { key: 'chat_rooms', title: 'Chat Rooms', url: createPageUrl('ChatRooms'), icon: MessageSquare, badge: null },
      { key: 'polls', title: 'Community Polls', url: createPageUrl('Polls'), icon: BarChart3, badge: null },
      { key: 'events', title: 'Events', url: createPageUrl('Events'), icon: CalendarDays, badge: null },
      { key: 'advisors', title: 'Advisors', url: createPageUrl('Advisors'), icon: Shield, badge: null },
      { key: 'finfluencers', title: 'Finfluencers', url: createPageUrl('Finfluencers'), icon: Star, badge: null },
      { key: 'educators', title: 'Educators', url: createPageUrl('Educators'), icon: GraduationCap, badge: null },
      { key: 'subscription', title: 'Subscription', url: createPageUrl('Subscription'), icon: Sparkles, badge: null },
      { key: 'feedback', title: 'Feedback', url: createPageUrl('Feedback'), icon: MessageSquare, badge: null },
    ];

    // In guest mode, show all items but mark premium ones
    if (isGuestMode) {
      return hardcodedOrder.map(item => {
        if (['advisors', 'finfluencers', 'educators'].includes(item.key)) {
          return {
            ...item,
            badge: {
              text: 'Premium',
              color: 'bg-purple-50 text-purple-700 border-purple-200'
            }
          };
        }
        return item;
      });
    }

    // Filter based on user role and subscription
    const filteredItems = hardcodedOrder.filter(item => {
      // Always show basic items
      if (['dashboard', 'my_portfolio', 'chat_rooms', 'polls', 'events', 'subscription', 'feedback'].includes(item.key)) {
        return true;
      }

      // Advisors, Finfluencers, Educators - show for subscribed users or admins
      if (['advisors', 'finfluencers', 'educators'].includes(item.key)) {
        return isSubscribed || (user && ['admin', 'super_admin'].includes(user.app_role));
      }

      return true;
    });

    // Add subscription badge
    const itemsWithBadges = filteredItems.map(item => {
      if (item.key === 'subscription' && user && !['admin', 'super_admin', 'vendor'].includes(user.app_role)) {
        return {
          ...item,
          badge: isSubscribed ? {
            text: 'Active',
            color: 'bg-green-50 text-green-700 border-green-200'
          } : {
            text: 'Premium',
            color: 'bg-purple-50 text-purple-700 border-purple-200'
          }
        };
      }
      return item;
    });

    // Add "Organize Events" for specific roles
    if (user && ['advisor', 'finfluencer', 'educator'].includes(user.app_role)) {
      itemsWithBadges.splice(5, 0, {
        key: 'organize_events',
        title: 'Organize Events',
        url: createPageUrl('OrganizerDashboard'),
        icon: CalendarDays,
        badge: null
      });
    }

    return itemsWithBadges;

  }, [user, isAuthCheckComplete, isSubscribed, isGuestMode]);

  if (!isAuthCheckComplete) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ✅ If SuperAdmin page, render children without layout wrapper AND without auth check
  if (isSuperAdminPage) {
    // ⚠️ AUTHENTICATION DISABLED FOR TESTING - RE-ENABLE FOR PRODUCTION
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <style>{`
        .sidebar-logo img {
          width: 180px;
          height: auto;
          object-fit: contain;
        }
        .sidebar-content-scrollable {
          overflow-y: auto;
          max-height: calc(100vh - 200px);
        }
        .sidebar-content-scrollable::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-content-scrollable::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-content-scrollable::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .sidebar-content-scrollable::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      <div className="flex h-screen w-full bg-gray-50">
        <Sidebar className="border-r border-gray-200 bg-white hidden md:flex md:flex-col">
          <SidebarHeader className="border-b border-gray-200">
            <div className="sidebar-logo">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bb21f4e5ccdcab161121f6/1dc7cf9b7_FinancialNetworkingLogoProtocol.png"
                alt="Protocol Logo"
              />
            </div>
          </SidebarHeader>

          <SidebarContent className="sidebar-content-scrollable flex-1 flex flex-col gap-2 overflow-y-auto p-3">
            {/* Guest Mode Banner */}
            {isGuestMode && (
              <div className="mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-md text-white relative group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      👤
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">Guest Mode</p>
                      <p className="text-xs text-white/80 mt-1">Exploring the platform</p>
                    </div>
                  </div>
                  <Link to={createPageUrl("Profile")}>
                    <div className="mt-3 bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 text-center cursor-pointer transition-all">
                      <span className="text-xs font-semibold flex items-center justify-center gap-2">
                        <LogIn className="w-3 h-3" />
                        Login to Save Progress
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            )}

            {/* Logged In User Profile */}
            {user && (
              <div className="mb-4">
                <Link to={createPageUrl("Profile")} className="block">
                  <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 cursor-pointer text-white relative group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {user.profile_image_url ? (
                          <img src={user.profile_image_url} alt={user.display_name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          user.display_name?.charAt(0)?.toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate text-sm">{user.display_name || 'Trader'}</p>
                      </div>
                      {/* Edit Icon - Shows on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Edit3 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-2">
                Trading Hub
              </SidebarGroupLabel>
              <SidebarMenu>
                {displayNavigationItems.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      asChild
                      className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1 ${
                        location.pathname === item.url ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-md' : ''
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="outline" className={`ml-auto text-xs ${item.badge.color}`}>
                            {item.badge.text}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-3">
                  {!isSubscribed && !isGuestMode && user && !['admin', 'super_admin', 'vendor'].includes(user.app_role) && ( 
                    <Link to={createPageUrl("Subscription")} className="block">
                      <div className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white shadow-md cursor-pointer hover:shadow-lg transition-all">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <Crown className="w-4 h-4"/>
                          Upgrade to Premium
                        </h3>
                        <p className="text-xs opacity-80 mt-1">Unlock advisor picks, premium polls, and exclusive content</p>
                      </div>
                    </Link>
                  )}
                  
                  {isGuestMode && (
                    <Link to={createPageUrl("Subscription")} className="block">
                      <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white shadow-md cursor-pointer hover:shadow-lg transition-all">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <Crown className="w-4 h-4"/>
                          Create Free Account
                        </h3>
                        <p className="text-xs opacity-80 mt-1">Save your portfolio, join discussions, and more</p>
                      </div>
                    </Link>
                  )}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200 p-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                      {user.profile_image_url ? (
                        <img src={user.profile_image_url} alt={user.display_name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        user.display_name?.charAt(0)?.toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.display_name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl("Profile")} className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to={createPageUrl("Profile")}>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 cursor-pointer transition-all text-white">
                  <LogIn className="w-5 h-5" />
                  <span className="font-semibold">Login / Sign Up</span>
                </div>
              </Link>
            )}
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">{currentPageName || 'Protocol'}</h1>
            <div className="flex items-center gap-4">
              {user && <RealtimeNotificationBell />}
              {isGuestMode && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  👤 Guest Mode
                </Badge>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <SubscriptionProvider>
      <EntityConfigProvider>
        <InnerLayout currentPageName={currentPageName}>{children}</InnerLayout>
      </EntityConfigProvider>
    </SubscriptionProvider>
  );
}

