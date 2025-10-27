import React from 'react';
import UniversalPaymentModal from '../payment/UniversalPaymentModal';
import { User } from '@/api/entities';
import { toast } from 'sonner';

/**
 * Subscription Payment Modal
 * Wrapper around UniversalPaymentModal for subscriptions
 */
export default function PaymentModal({ open, onClose, plan, onPaymentSuccess }) {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
        toast.error('Failed to load user information');
      }
    };

    if (open) {
      loadUser();
    }
  }, [open]);

  if (!plan || !user) return null;

  const handleSuccess = (paymentData) => {
    console.log('✅ Payment completed:', paymentData);
    
    // Call the parent success handler with payment data
    if (onPaymentSuccess) {
      onPaymentSuccess(paymentData);
    }
  };

  const handleFailure = (error) => {
    console.error('❌ Payment failed:', error);
    toast.error('Payment failed. Please try again.');
  };

  return (
    <UniversalPaymentModal
      open={open}
      onClose={onClose}
      amount={plan.price}
      currency="INR"
      description={`${plan.name} Subscription - ${plan.cycle === 'monthly' ? 'Monthly' : 'Annual'}`}
      customerInfo={{
        name: user.display_name || user.full_name || 'User',
        email: user.email
      }}
      metadata={{
        subscription_plan_id: plan.id,
        plan_name: plan.name,
        billing_cycle: plan.cycle,
        user_id: user.id,
        ...(plan.discount && {
          promo_code: plan.discount.code,
          discount_amount: plan.discount.amount,
          original_price: plan.originalPrice
        })
      }}
      onSuccess={handleSuccess}
      onFailure={handleFailure}
    />
  );
}