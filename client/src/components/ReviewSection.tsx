import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StarRating, RatingSummary } from "./StarRating";
import { toast } from "sonner";
import { MessageSquare, Loader2, Trash2, CheckCircle } from "lucide-react";
import { getLoginUrl } from "@/const";
import { formatDistanceToNow } from "date-fns";

interface ReviewSectionProps {
  resourceId: number;
  resourceName: string;
}

export function ReviewSection({ resourceId, resourceName }: ReviewSectionProps) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const reviewsQuery = trpc.reviews.list.useQuery({ resourceId });
  const myReviewQuery = trpc.reviews.mine.useQuery(
    { resourceId },
    { enabled: isAuthenticated }
  );

  const submitMutation = trpc.reviews.submit.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your review!");
      utils.reviews.list.invalidate({ resourceId });
      utils.reviews.mine.invalidate({ resourceId });
      setRating(0);
      setReviewText("");
      setShowForm(false);
    },
    onError: () => toast.error("Failed to submit review. Please try again."),
  });

  const deleteMutation = trpc.reviews.delete.useMutation({
    onSuccess: () => {
      toast.success("Review removed.");
      utils.reviews.list.invalidate({ resourceId });
      utils.reviews.mine.invalidate({ resourceId });
    },
    onError: () => toast.error("Failed to remove review."),
  });

  const data = reviewsQuery.data;
  const myReview = myReviewQuery.data;

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    submitMutation.mutate({ resourceId, rating, reviewText: reviewText || undefined, isAnonymous });
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-[#1B2A4A]" />
            Community Reviews
          </CardTitle>
          {data && data.totalCount > 0 && (
            <RatingSummary average={data.averageRating} count={data.totalCount} size="md" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Submit / Edit Form */}
        {isAuthenticated ? (
          myReview ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">You reviewed this resource</span>
                  </div>
                  <StarRating value={myReview.rating} readonly size="sm" />
                  {myReview.reviewText && (
                    <p className="text-sm text-gray-600 mt-1">{myReview.reviewText}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => deleteMutation.mutate({ reviewId: myReview.id })}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : showForm ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Your Rating</Label>
                <StarRating value={rating} onChange={setRating} size="lg" showLabel />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Your Experience <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={`Share how ${resourceName} helped you or your family...`}
                  className="resize-none"
                  rows={3}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-400 mt-1">{reviewText.length}/1000</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous" className="text-sm text-gray-600 cursor-pointer">
                  Post anonymously
                </Label>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending || rating === 0}
                  className="bg-[#1B2A4A] hover:bg-[#2a3f6f]"
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Submit Review
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowForm(true)}
              className="border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#1B2A4A]/5"
            >
              Write a Review
            </Button>
          )
        ) : (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <a href={getLoginUrl()} className="font-medium underline">
              Sign in
            </a>{" "}
            to leave a review and help other veterans find the best resources.
          </div>
        )}

        {/* Review List */}
        {reviewsQuery.isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : data && data.reviews.length > 0 ? (
          <div className="space-y-4 divide-y divide-gray-100">
            {data.reviews.map((review) => (
              <div key={review.id} className="pt-4 first:pt-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center text-xs font-bold text-[#1B2A4A]">
                      {review.isAnonymous ? "A" : "V"}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {review.isAnonymous ? "Anonymous Veteran" : "Verified User"}
                    </span>
                    <Badge variant="outline" className="text-xs py-0">
                      {review.isAnonymous ? "Anonymous" : "Member"}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <StarRating value={review.rating} readonly size="sm" />
                {review.reviewText && (
                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{review.reviewText}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            No reviews yet. Be the first to share your experience.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
