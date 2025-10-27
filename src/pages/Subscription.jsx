
import React, { useState, useEffect } from "react";
import {   Subscription as SubscriptionModel, SubscriptionPlan, User, SubscriptionTransaction, PromoCode } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Crown, Zap, Check, Tag, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import PlanCard from "../components/subscription/PlanCard";
import CurrentPlan from "../components/subscription/CurrentPlan";
import PaymentModal from "../components/subscription/PaymentModal";
import CancellationModal from "../components/subscription/CancellationModal";
import { Link } from "react-router-dom"; // Assuming react-router-dom for Link

// Placeholder for createPageUrl function - replace with your actual implementation
const createPageUrl = (pageName) => {
  switch (pageName) {
    case "Profile":
      return "/profile";
    case "Home":
      return "/";
    default:
      return "/";
  }
};

// Sample plans for guest mode or when no active plans are found
const samplePlans = [
  {
    id: "basic_sample",
    name: "Basic",
    description: "Access essential features to start your journey.",
    price_monthly: 0,
    price_annually: 0,
    is_active: true,
    features: ['Chat Rooms', 'Community Polls'],
    recommended: false,
    color: 'text-gray-600'
  },
  {
    id: "premium_sample",
    name: "Premium",
    description: "Unlock advanced tools and exclusive content.",
    price_monthly: 499,
    price_annually: 4999,
    is_active: true,
    features: ['Chat Rooms', 'Community Polls', 'Advisor Picks', 'Premium Polls', 'Pledge Pool Access'],
    recommended: true,
    color: 'text-blue-600'
  },
  {
    id: "vip_sample",
    name: "VIP",
    description: "All features, priority support, and exclusive events.",
    price_monthly: 999,
    price_annually: 9999,
    is_active: true,
    features: ['Chat Rooms', 'Community Polls', 'Advisor Picks', 'Premium Polls', 'Pledge Pool Access', 'Priority Support', 'Exclusive Events'],
    recommended: false,
    color: 'text-purple-600'
  }
];

export default function Subscription() {
  const [plans, setPlans] = useState([]);
  const [user, setUser] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState('monthly');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Try to get user
        const currentUser = await User.me().catch(() => null);
        
        if (!isMounted || abortController.signal.aborted) return;
        
        setUser(currentUser);

        // Load subscription plans
        const loadedPlans = await SubscriptionPlan.filter({ 
          is_active: true 
        }, 'price_monthly').catch(() => []); // Assuming filter supports sort parameter
        
        if (isMounted && !abortController.signal.aborted) {
          if (loadedPlans.length > 0) {
            setPlans(loadedPlans);
          } else {
            setPlans(samplePlans);
          }
        }

        // Load current subscription only if user is logged in and not an admin
        if (currentUser && !['admin', 'super_admin'].includes(currentUser.app_role)) {
          try {
            const userSubs = await SubscriptionModel.filter({ 
              user_id: currentUser.id, 
              status: 'active' 
            }, '-created_date', 1).catch(() => []); // Get most recent active sub
            
            if (isMounted && !abortController.signal.aborted) {
              setCurrentSubscription(userSubs[0] || null);
            }
          } catch (error) {
            console.log("No active subscription for user", currentUser.id);
            if (isMounted && !abortController.signal.aborted) {
                setCurrentSubscription(null);
            }
          }
        } else {
            if (isMounted && !abortController.signal.aborted) {
                setCurrentSubscription(null); // No user or admin, no user subscription to show
            }
        }

      } catch (error) {
        if (!isMounted || abortController.signal.aborted) return;
        console.error("Error loading subscription data, falling back to guest mode:", error);
        toast.error("Failed to load subscription plans, showing sample plans.");
        setUser(null); // Ensure user is null on error
        setPlans(samplePlans); // Show sample plans on error
        setCurrentSubscription(null); // No subscription on error
      } finally {
        if (isMounted && !abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsValidatingPromo(true);
    try {
      const promoCodes = await PromoCode.filter({ code: promoCode.trim(), is_active: true });
      
      if (promoCodes.length === 0) {
        toast.error('Invalid or expired promo code');
        setAppliedPromo(null);
        return;
      }

      const promo = promoCodes[0];

      if (promo.expiry_date && new Date(promo.expiry_date) < new Date()) {
        toast.error('This promo code has expired');
        setAppliedPromo(null);
        return;
      }

      if (promo.usage_limit && promo.current_usage >= promo.usage_limit) {
        toast.error('This promo code has reached its usage limit');
        setAppliedPromo(null);
        return;
      }

      setAppliedPromo(promo);
      toast.success(`Promo code applied! ${promo.discount_type === 'percentage' ? `${promo.discount_value}% off` : `₹${promo.discount_value} off`}`);
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast.error('Failed to apply promo code');
      setAppliedPromo(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleSelectPlan = (plan, cycle) => {
    // Require login for subscription
    if (!user) {
      toast.info("Please log in to subscribe to a plan");
      // Redirect to profile/login
      window.location.href = createPageUrl("Profile");
      return;
    }

    setSelectedPlan(plan);
    setSelectedCycle(cycle);
    setShowPaymentModal(true);
  };

  const calculateFinalAmount = (plan, cycle) => {
    const baseAmount = cycle === 'monthly' ? plan.price_monthly : plan.price_annually;
    
    if (!appliedPromo) return baseAmount;

    if (appliedPromo.discount_type === 'percentage') {
      return baseAmount - (baseAmount * appliedPromo.discount_value / 100);
    } else {
      return Math.max(0, baseAmount - appliedPromo.discount_value);
    }
  };

  const handlePaymentSuccess = async (plan, cycle, paymentData) => {
    console.log('💳 Payment successful, creating subscription...', paymentData);
    
    try {
      const baseAmount = cycle === 'monthly' ? plan.price_monthly : plan.price_annually;
      const finalAmount = calculateFinalAmount(plan, cycle);
      const discountAmount = baseAmount - finalAmount;

      const startDate = new Date();
      const endDate = new Date(startDate);
      if (cycle === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const transaction = await SubscriptionTransaction.create({
        user_id: user.id,
        subscription_plan_id: plan.id,
        plan_name: plan.name,
        billing_cycle: cycle === 'monthly' ? 'monthly' : 'annual',
        gross_amount: baseAmount,
        promo_code_id: appliedPromo?.id || null,
        promo_code: appliedPromo?.code || null,
        discount_type: appliedPromo?.discount_type || null,
        discount_amount: discountAmount,
        net_amount: finalAmount,
        payment_method: paymentData.method || 'razorpay',
        payment_id: paymentData.paymentId,
        payment_status: 'completed',
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate.toISOString(),
      });

      console.log('✅ Transaction created:', transaction.id);

      if (currentSubscription) {
        await SubscriptionModel.update(currentSubscription.id, {
          status: 'cancelled',
          cancelAtPeriodEnd: false
        });
        console.log('✅ Old subscription cancelled');
      }

      const newSubscription = await SubscriptionModel.create({
        user_id: user.id,
        plan_type: plan.name.toLowerCase(),
        status: 'active',
        price: finalAmount,
        features: plan.features || [],
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        auto_renew: true,
        payment_id: paymentData.paymentId,
        cancelAtPeriodEnd: false
      });

      console.log('✅ New subscription created:', newSubscription.id);

      if (appliedPromo) {
        await PromoCode.update(appliedPromo.id, {
          current_usage: (appliedPromo.current_usage || 0) + 1
        });
        console.log('✅ Promo code usage updated');
      }

      toast.success(`🎉 Successfully subscribed to ${plan.name}!`);
      
      setShowPaymentModal(false);
      setSelectedPlan(null);
      setAppliedPromo(null);
      setPromoCode('');
      
      await loadData();

    } catch (error) {
      console.error('❌ Error creating subscription:', error);
      toast.error('Payment successful but failed to activate subscription. Please contact support.');
    }
  };

  const handleCancelSubscription = async (cancellationData) => {
    if (!currentSubscription) return;
    
    setIsCancelling(true);
    try {
      await SubscriptionModel.update(currentSubscription.id, {
        cancelAtPeriodEnd: true,
        cancellation_reason: cancellationData.reason,
        cancellation_category: cancellationData.reason_category,
        cancellation_feedback: cancellationData.additional_feedback,
        cancellation_date: new Date().toISOString()
      });
      
      toast.success('Subscription cancelled. You will retain access until the end of your billing period.');
      
      setShowCancellationModal(false);
      await loadData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleUpgrade = () => {
    const plansSection = document.querySelector('.plans-grid');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      {/* Guest Mode Banner */}
      {!user && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-purple-900">Explore Our Plans</p>
                <p className="text-xs text-purple-700 mt-1">Log in to subscribe and unlock premium features</p>
              </div>
              <Link to={createPageUrl("Profile")}>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  Log In to Subscribe
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full">
            <Crown className="w-5 h-5" />
            <span className="font-semibold">Premium Features</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Unlock exclusive features, advisor picks, and premium content to enhance your trading journey
          </p>
        </div>

        {currentSubscription && (
          <CurrentPlan 
            subscription={currentSubscription} 
            onUpgrade={handleUpgrade}
            onCancelSubscription={() => setShowCancellationModal(true)}
            isCancelling={isCancelling}
          />
        )}

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tag className="w-5 h-5" />
              Have a Promo Code?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={isValidatingPromo || !!appliedPromo}
              />
              {appliedPromo ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setAppliedPromo(null);
                    setPromoCode('');
                    toast.info('Promo code removed');
                  }}
                >
                  Remove
                </Button>
              ) : (
                <Button
                  onClick={handleApplyPromo}
                  disabled={isValidatingPromo || !promoCode.trim()}
                >
                  {isValidatingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                </Button>
              )}
            </div>
            {appliedPromo && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                <Check className="w-4 h-4" />
                <span>
                  {appliedPromo.discount_type === 'percentage'
                    ? `${appliedPromo.discount_value}% discount applied`
                    : `₹${appliedPromo.discount_value} discount applied`}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto plans-grid">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={currentSubscription?.plan_type === plan.name.toLowerCase()}
              onSelect={handleSelectPlan}
              appliedPromo={appliedPromo}
              calculateFinalAmount={calculateFinalAmount}
            />
          ))}
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Feature Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 font-semibold border-b pb-4">
                <div>Feature</div>
                <div className="text-center">Basic</div>
                <div className="text-center">Premium</div>
                <div className="text-center">VIP</div>
              </div>
              
              {[
                { feature: 'Chat Rooms', basic: true, premium: true, vip: true },
                { feature: 'Community Polls', basic: true, premium: true, vip: true },
                { feature: 'Advisor Picks', basic: false, premium: true, vip: true },
                { feature: 'Premium Polls', basic: false, premium: true, vip: true },
                { feature: 'Pledge Pool Access', basic: false, premium: true, vip: true },
                { feature: 'Priority Support', basic: false, premium: false, vip: true },
                { feature: 'Exclusive Events', basic: false, premium: false, vip: true },
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-4 py-2 border-b">
                  <div className="text-gray-700">{row.feature}</div>
                  <div className="text-center">
                    {row.basic ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </div>
                  <div className="text-center">
                    {row.premium ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </div>
                  <div className="text-center">
                    {row.vip ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600 text-sm">Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600 text-sm">We accept all major credit/debit cards, UPI, net banking, and digital wallets through our secure payment gateway.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Can I upgrade or downgrade my plan?</h4>
              <p className="text-gray-600 text-sm">Yes, you can change your plan at any time. The new pricing will be prorated based on your current billing cycle.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedPlan && (
        <PaymentModal
          open={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
          plan={{
            ...selectedPlan,
            price: calculateFinalAmount(selectedPlan, selectedCycle),
            originalPrice: selectedCycle === 'monthly' ? selectedPlan.price_monthly : selectedPlan.price_annually,
            cycle: selectedCycle,
            discount: appliedPromo ? {
              code: appliedPromo.code,
              amount: (selectedCycle === 'monthly' ? selectedPlan.price_monthly : selectedPlan.price_annually) - calculateFinalAmount(selectedPlan, selectedCycle)
            } : null
          }}
          onPaymentSuccess={(paymentData) => handlePaymentSuccess(selectedPlan, selectedCycle, paymentData)}
        />
      )}

      <CancellationModal
        open={showCancellationModal}
        onClose={() => setShowCancellationModal(false)}
        onConfirm={handleCancelSubscription}
        isLoading={isCancelling}
      />
    </div>
  );
}
