"use client";
import React, {
  useEffect,
  useState,
} from "react";
import { motion } from "framer-motion";
import { Star as StarIcon, ShieldCheck, CheckCircle2, MessageSquareQuote } from "lucide-react";

import { API_URL } from "@/lib/api";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { PageHeader, StatChip, EmptyState, SkeletonGrid, staggerContainer, fadeUp } from "./ui-kit";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: {
    _id: string;
    name: string;
    email: string;
  };
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`size-4 ${
          i < rating
            ? "fill-amber-gold text-amber-gold"
            : "text-muted-foreground/30"
        }`}
      />
    ))}
  </div>
);

const Reviews: React.FC = () => {
  const { profile, loading: profileLoading } = useUserProfile();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const loading = profileLoading || reviewsLoading;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/api/reviews/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader icon={MessageSquareQuote} eyebrow="Reputation" title="Your Reviews" subtitle="Loading what people are saying..." />
        <SkeletonGrid count={3} className="h-32" cols="" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon={MessageSquareQuote}
        eyebrow="Reputation"
        title="Your Reviews"
        subtitle="What people you've matched with are saying about learning and teaching with you."
        action={
          <div className="flex flex-wrap gap-3">
            <StatChip
              icon={StarIcon}
              label="Rating"
              value={profile?.rating?.toFixed?.(1) ?? profile?.rating ?? 0}
              tone="amber"
            />
            <StatChip
              icon={CheckCircle2}
              label="Sessions"
              value={profile?.completedSessions ?? 0}
            />
            <StatChip
              icon={ShieldCheck}
              label="Reliability"
              value={`${profile?.reliabilityScore ?? 100}%`}
            />
          </div>
        }
      />

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <EmptyState
            icon={MessageSquareQuote}
            title="No reviews yet"
            subtitle="Reviews from your completed matches will show up here."
          />
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
            {reviews.map((review) => (
              <motion.div
                variants={fadeUp}
                key={review._id}
                className="rounded-3xl border bg-card p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-ink to-amber-gold font-semibold text-white">
                    {review.reviewer.name?.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">
                          {review.reviewer.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <StarRating rating={review.rating} />
                    </div>

                    {review.comment && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
