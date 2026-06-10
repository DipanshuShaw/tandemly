"use client";
import React, {
  useEffect,
  useState,
} from "react";


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

interface UserProfile {
  name: string;
  rating: number;
  completedSessions: number;
  reliabilityScore: number;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);


const Reviews: React.FC = () => {
  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [profile, setProfile] =
    useState<UserProfile | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

const fetchData = async () => {
  try {
    const token =
      localStorage.getItem(
        "token"
      );

    const [reviewsRes, profileRes] =
      await Promise.all([
        fetch(
          "http://localhost:5000/api/reviews/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),

        fetch(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),
      ]);

    const reviewsData =
      await reviewsRes.json();

    const profileData =
      await profileRes.json();

    setReviews(reviewsData);

    setProfile(profileData);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchData();
}, []);


if (loading) {
  return (
    <div>
      Loading Reviews...
    </div>
  );
}   

return (
  <div>
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-text-primary">
        Your Reviews
      </h2>

      <div className="mt-4 bg-surface p-4 rounded-2xl shadow-lg space-y-2">
        <p>
          <span className="font-semibold">
            Rating:
          </span>{" "}
          ⭐ {profile?.rating || 0}
        </p>

        <p>
          <span className="font-semibold">
            Completed Sessions:
          </span>{" "}
          {profile?.completedSessions || 0}
        </p>

        <p>
          <span className="font-semibold">
            Reliability:
          </span>{" "}
          {profile?.reliabilityScore || 100}%
        </p>
      </div>
    </div>

    <div className="space-y-6">
      {reviews.length === 0 ? (
        <div className="bg-surface p-6 rounded-2xl shadow-lg text-center">
          No reviews yet.
        </div>
      ) : (
        reviews.map((review) => (
          <div
            key={review._id}
            className="bg-surface p-6 rounded-2xl shadow-lg"
          >
            <div className="flex items-start space-x-4">
              <img
                src={`https://ui-avatars.com/api/?name=${review.reviewer.name}`}
                alt={review.reviewer.name}
                className="w-12 h-12 rounded-full object-cover"
              />

              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-text-primary">
                      {review.reviewer.name}
                    </p>

                    <p className="text-sm text-text-secondary">
                      {new Date(
                        review.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <StarRating
                    rating={review.rating}
                  />
                </div>

                <p className="mt-3 text-text-secondary">
                  {review.comment}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);
}

export default Reviews;