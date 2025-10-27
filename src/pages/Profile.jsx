
import React, { useState, useEffect } from "react";
import { User, Referral, ReferralBadge, Subscription } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Award,
  Crown,
  Shield,
  Star,
  UserIcon, // New import
  LogIn // New import
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button"; // New import
import { Link } from "react-router-dom"; // New import

import ProfileGeneralSettings from "../components/profile/ProfileGeneralSettings";
import ProfileReferralSection from "../components/profile/ProfileReferralSection";
import ProfileSubscriptionSection from "../components/profile/ProfileSubscriptionSection";
import ProfileTrustScore from "../components/profile/ProfileTrustScore";
import ProfileCreditsSection from "../components/profile/ProfileCreditsSection";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [badges, setBadges] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      try {
        // Try to get user
        const currentUser = await User.me().catch(() => null);

        if (!isMounted) return;

        if (currentUser) {
          setUser(currentUser);

          // Load additional data for logged-in users
          try {
            const [userSubs, userReferrals] = await Promise.all([
              Subscription.filter({ user_id: currentUser.id, status: 'active' }).catch(() => []),
              Referral.filter({ inviter_id: currentUser.id }).catch(() => [])
            ]);

            if (isMounted) {
              setSubscription(userSubs[0] || null);
              setReferrals(userReferrals);
              // Note: ReferralBadge data loading for 'badges' state is removed here as per outline.
              // 'badges' will remain an empty array unless loaded elsewhere or if component allows empty state.
            }
          } catch (error) {
            console.log("Error loading additional user data:", error);
          }
        } else {
          // Guest user - show login/signup options
          setUser(null);
        }

      } catch (error) {
        if (isMounted) {
          console.log("Loading profile in guest mode:", error);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>);
  }

  // If no user, show login/signup page
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mx-auto flex items-center justify-center mb-4">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Protocol</h2>
            <p className="text-gray-600 mb-6">Log in or sign up to access your profile and personalized features</p>

            <div className="space-y-3">
              <Button
                onClick={() => {/* Implement login logic */}}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Log In
              </Button>

              <Button
                onClick={() => {/* Implement signup logic */}}
                variant="outline"
                className="w-full"
              >
                Create Free Account
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-gray-500 mb-4">Continue exploring as a guest:</p>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            {user.profile_image_url ?
            <img src={user.profile_image_url} alt={user.display_name} className="w-24 h-24 rounded-full object-cover" /> :

            user.display_name?.[0]
            }
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{user.display_name}</h1>
            <p className="text-slate-600">{user.email}</p>
          </div>
        </div>

        {/* Profile Tabs */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <Tabs defaultValue="general" className="space-y-6 finfluencer-tabs">
              <TabsList className="grid w-full grid-cols-5 max-w-4xl mx-auto">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">General</span>
                </TabsTrigger>
                <TabsTrigger value="referrals" className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span className="hidden sm:inline">Referrals</span>
                </TabsTrigger>
                <TabsTrigger value="subscription" className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  <span className="hidden sm:inline">Subscription</span>
                </TabsTrigger>
                <TabsTrigger value="trust-score" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Trust Score</span>
                </TabsTrigger>
                <TabsTrigger value="credits" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span className="hidden sm:inline">Credits</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-6">
                <ProfileGeneralSettings user={user} onUserUpdate={setUser} />
              </TabsContent>

              <TabsContent value="referrals" className="mt-6">
                <ProfileReferralSection
                  user={user}
                  referrals={referrals}
                  badges={badges} />
              </TabsContent>

              <TabsContent value="subscription" className="mt-6">
                <ProfileSubscriptionSection subscription={subscription} />
              </TabsContent>

              <TabsContent value="trust-score" className="mt-6">
                <ProfileTrustScore user={user} />
              </TabsContent>

              <TabsContent value="credits" className="mt-6">
                <ProfileCreditsSection user={user} referrals={referrals} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
