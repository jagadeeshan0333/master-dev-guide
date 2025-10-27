import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Star, Users, Lock, Shield, BarChart3, ArrowLeft, Crown, Sparkles } from "lucide-react";

export default function PlanCard({ plan, isCurrentPlan, onSelect, appliedPromo, calculateFinalAmount }) {
  const isVipPlan = plan.name.toLowerCase().includes('vip') || plan.name.toLowerCase().includes('elite');
  const isPremiumPlan = plan.name.toLowerCase().includes('premium');

  const getCardStyle = () => {
    if (isVipPlan) {
      return "border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 relative overflow-hidden";
    }
    if (isPremiumPlan) {
      return "border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50";
    }
    return "border border-gray-200 bg-white";
  };

  const getIcon = () => {
    if (isVipPlan) {
      return <Crown className="w-6 h-6 text-yellow-600" />;
    }
    if (isPremiumPlan) {
      return <Sparkles className="w-6 h-6 text-purple-600" />;
    }
    return <CheckCircle className="w-6 h-6 text-blue-600" />;
  };

  const getButtonStyle = () => {
    if (isCurrentPlan) return "bg-gray-300 text-gray-500 cursor-not-allowed";
    if (isVipPlan) {
      return "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600";
    }
    if (isPremiumPlan) {
      return "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600";
    }
    return "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600";
  };

  // Calculate prices with discounts
  const monthlyPrice = plan.price_monthly || 0;
  const annualPrice = plan.price_annually || 0;
  
  const finalMonthlyPrice = appliedPromo && calculateFinalAmount 
    ? calculateFinalAmount(plan, 'monthly') 
    : monthlyPrice;
  
  const finalAnnualPrice = appliedPromo && calculateFinalAmount 
    ? calculateFinalAmount(plan, 'annually') 
    : annualPrice;

  const monthlyDiscount = monthlyPrice - finalMonthlyPrice;
  const annualDiscount = annualPrice - finalAnnualPrice;

  return (
    <Card className={`${getCardStyle()} transition-all duration-300 hover:shadow-xl transform hover:scale-105`}>
      {plan.popular && (
        <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          MOST POPULAR
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          {getIcon()}
        </div>
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        
        {/* Monthly Price */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 uppercase">Monthly</p>
          <div className="flex items-center justify-center gap-2">
            {monthlyDiscount > 0 && (
              <span className="text-lg text-gray-400 line-through">₹{monthlyPrice}</span>
            )}
            <div className="text-3xl font-bold text-gray-900">
              ₹{finalMonthlyPrice.toLocaleString()}
            </div>
          </div>
          {monthlyDiscount > 0 && (
            <Badge className="bg-green-100 text-green-700 text-xs mt-1">
              Save ₹{monthlyDiscount}
            </Badge>
          )}
        </div>

        {/* Annual Price */}
        {annualPrice > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 uppercase">Annual</p>
            <div className="flex items-center justify-center gap-2">
              {annualDiscount > 0 && (
                <span className="text-lg text-gray-400 line-through">₹{annualPrice}</span>
              )}
              <div className="text-2xl font-bold text-gray-900">
                ₹{finalAnnualPrice.toLocaleString()}
              </div>
            </div>
            {annualDiscount > 0 && (
              <Badge className="bg-green-100 text-green-700 text-xs mt-1">
                Save ₹{annualDiscount}
              </Badge>
            )}
          </div>
        )}

        <p className="text-sm text-gray-600 mt-3">{plan.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          {plan.features && plan.features.length > 0 ? (
            plan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700 leading-relaxed">
                  {feature}
                </span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 italic text-center py-2">
              No features specified
            </div>
          )}
        </div>

        <div className="pt-4 space-y-2">
          {/* Monthly Button */}
          <Button
            onClick={() => onSelect(plan, 'monthly')}
            disabled={isCurrentPlan}
            className={`w-full text-white font-semibold py-3 rounded-xl transition-all duration-300 ${getButtonStyle()}`}
          >
            {isCurrentPlan ? "Current Plan" : `Subscribe Monthly - ₹${finalMonthlyPrice}`}
          </Button>

          {/* Annual Button */}
          {annualPrice > 0 && (
            <Button
              onClick={() => onSelect(plan, 'annually')}
              disabled={isCurrentPlan}
              variant="outline"
              className="w-full font-semibold py-3 rounded-xl transition-all duration-300 border-2"
            >
              {isCurrentPlan ? "Current Plan" : `Subscribe Annually - ₹${finalAnnualPrice}`}
            </Button>
          )}
        </div>

        {isCurrentPlan && (
          <Badge className="w-full justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 shadow-lg border-2 border-purple-700 font-semibold hover:from-blue-700 hover:to-purple-700 transition-all">
            <CheckCircle className="w-4 h-4 mr-2" />
            You're currently on this plan
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}