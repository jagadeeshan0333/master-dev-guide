import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function CancellationModal({ open, onClose, onConfirm, isLoading }) {
  const [reason, setReason] = useState('');
  const [reasonCategory, setReasonCategory] = useState('too_expensive');
  const [additionalFeedback, setAdditionalFeedback] = useState('');

  const handleSubmit = () => {
    if (!reason && !additionalFeedback) {
      return;
    }
    onConfirm({
      reason_category: reasonCategory,
      reason: reason || reasonCategory,
      additional_feedback: additionalFeedback
    });
  };

  const reasonOptions = [
    { value: 'too_expensive', label: 'Too expensive' },
    { value: 'not_using', label: 'Not using the features' },
    { value: 'found_alternative', label: 'Found a better alternative' },
    { value: 'technical_issues', label: 'Experiencing technical issues' },
    { value: 'temporary_break', label: 'Taking a temporary break' },
    { value: 'other', label: 'Other reason' }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Cancel Subscription
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 mt-2">
            We're sorry to see you go! Please help us understand why you're cancelling.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Reason Category */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">
              What's the main reason for cancelling? *
            </Label>
            <RadioGroup value={reasonCategory} onValueChange={setReasonCategory}>
              {reasonOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label 
                    htmlFor={option.value} 
                    className="font-normal cursor-pointer text-sm"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Additional Feedback */}
          <div>
            <Label htmlFor="feedback" className="text-sm font-semibold mb-2 block">
              Additional feedback (optional)
            </Label>
            <Textarea
              id="feedback"
              placeholder="Tell us more about your experience or what we could improve..."
              value={additionalFeedback}
              onChange={(e) => setAdditionalFeedback(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Your feedback helps us improve our service
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> You'll retain access to all premium features until the end of your current billing period on your subscription end date.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Keep Subscription
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Confirm Cancellation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}