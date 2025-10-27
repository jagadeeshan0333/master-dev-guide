
import React, { useState, useEffect } from 'react';
import { User, Feedback as FeedbackEntity } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Star, Send, CheckCircle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import FeedbackForm from '../components/feedback/FeedbackForm';
import SubmitReviewModal from '../components/reviews/SubmitReviewModal';

export default function FeedbackPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submittedFeedback, setSubmittedFeedback] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    let fetchedUser = null;
    try {
      // Attempt to load current user, handling errors gracefully for guests
      fetchedUser = await User.me().catch((error) => {
        console.log('User not logged in, loading in guest mode:', error.message);
        return null; // Return null if user fetching fails (e.g., 401 Unauthorized)
      });
      setUser(fetchedUser);

      // If a user was successfully fetched, try to load their feedback
      if (fetchedUser) {
        const userFeedback = await FeedbackEntity.filter({ user_id: fetchedUser.id }, '-created_date').catch((feedbackError) => {
          console.error('Error loading user feedback:', feedbackError);
          return []; // Return an empty array on error
        });
        setSubmittedFeedback(userFeedback);
      } else {
        // If no user (guest), set submitted feedback to an empty array
        setSubmittedFeedback([]);
      }
    } catch (unexpectedError) {
      // This catch block handles any other unexpected errors during the process
      console.error('An unexpected error occurred during data loading:', unexpectedError);
    } finally {
      // Always set isLoading to false once data loading (or attempt) is complete
      setIsLoading(false);
    }
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      // This function should only be called if `user` is not null, as handled by FeedbackForm
      if (!user) {
        toast.error('You must be logged in to submit feedback.');
        return;
      }
      await FeedbackEntity.create({
        ...feedbackData,
        user_id: user.id,
        status: 'new'
      });
      toast.success('Thank you for your feedback!');
      loadData(); // Reload to show submitted feedback
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  const handleReviewSubmit = async () => {
    setShowReviewModal(false);
    toast.success('Thank you for your review!');
    // Review is handled inside the modal
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full">
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold">Your Voice Matters</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Share Your Feedback
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Help us improve Protocol by sharing your thoughts, suggestions, and ideas. We value your input!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Submit Feedback</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Share suggestions, report issues, or request new features
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => setShowReviewModal(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Write a Review</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Rate your experience and help others discover Protocol
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Form */}
        <FeedbackForm user={user} onSubmit={handleFeedbackSubmit} />

        {/* Previous Feedback */}
        {submittedFeedback.length > 0 && (
          <Card>
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Your Previous Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {submittedFeedback.map((feedback) => (
                  <div key={feedback.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {feedback.user_role}
                        </Badge>
                        <Badge
                          className={
                            feedback.status === 'new' ? 'bg-blue-100 text-blue-700' :
                            feedback.status === 'under_review' ? 'bg-yellow-100 text-yellow-700' :
                            feedback.status === 'implemented' ? 'bg-green-100 text-green-700' :
                            'bg-slate-100 text-slate-700'
                          }
                        >
                          {feedback.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(feedback.created_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{feedback.feedback_text}</p>
                    {feedback.admin_notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Admin Response:</p>
                        <p className="text-xs text-blue-800">{feedback.admin_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              What happens to your feedback?
            </h3>
            <div className="space-y-2 text-sm text-slate-700">
              <p>✅ All feedback is reviewed by our team</p>
              <p>✅ Popular requests are prioritized for development</p>
              <p>✅ You'll be notified when your suggestion is implemented</p>
              <p>✅ Your input directly shapes the future of Protocol</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Write Review Modal */}
      <SubmitReviewModal
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSuccess={handleReviewSubmit}
      />
    </div>
  );
}
