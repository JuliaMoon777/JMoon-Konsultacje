import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Review, ReviewStats, ServiceType } from '../types';
import { MATRIX_REVIEWS } from '../data/reviews';

interface ReviewsContextType {
  // Public reviews state (only published)
  reviews: Review[];
  isLoading: boolean;
  totalPublishedCount: number;
  averageRating: number;
  getReviewsByService: (service: ServiceType) => Review[];

  // Admin state & actions
  isAdmin: boolean;
  adminReviews: Review[];
  adminStats: ReviewStats | null;
  adminError: string | null;
  loginAdmin: (password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  createReview: (reviewData: {
    name: string;
    service: ServiceType;
    rating: number;
    text: string;
    date?: string;
    published: boolean;
  }) => Promise<{ success: boolean; message?: string }>;
  updateReview: (
    id: string,
    reviewData: Partial<Omit<Review, 'id'>>
  ) => Promise<{ success: boolean; message?: string }>;
  deleteReview: (id: string) => Promise<{ success: boolean; message?: string }>;
  togglePublishReview: (id: string, currentStatus: boolean) => Promise<{ success: boolean }>;
  refreshReviews: () => Promise<void>;
}

const ReviewsContext = createContext<ReviewsContextType | null>(null);

export const ReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviews, setReviews] = useState<Review[]>(MATRIX_REVIEWS);
  const [adminReviews, setAdminReviews] = useState<Review[]>(MATRIX_REVIEWS);
  const [adminStats, setAdminStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    // Only session token, never password
    return typeof window !== 'undefined' ? sessionStorage.getItem('jmoon_adm_token') : null;
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(Boolean(adminToken));
  const [adminError, setAdminError] = useState<string | null>(null);

  // Fetch public or admin reviews
  const fetchReviews = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const res = await fetch('/api/reviews', { headers });
      if (!res.ok) {
        if (res.status === 401 && adminToken) {
          // Token expired
          setAdminToken(null);
          setIsAdmin(false);
          sessionStorage.removeItem('jmoon_adm_token');
        }
        return;
      }

      const data = await res.json();
      if (data && Array.isArray(data.reviews)) {
        if (data.isAdmin) {
          setAdminReviews(data.reviews);
          setReviews(data.reviews.filter((r: Review) => r.published));
          setIsAdmin(true);
        } else {
          setReviews(data.reviews);
        }
      }
    } catch (err) {
      console.warn('[Reviews] Could not load from API, using fallback data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [adminToken]);

  // Fetch admin stats
  const fetchStats = useCallback(async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setAdminStats(data.stats);
        }
      }
    } catch (err) {
      console.warn('[Reviews] Could not load stats:', err);
    }
  }, [adminToken]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (isAdmin && adminToken) {
      fetchStats();
    }
  }, [isAdmin, adminToken, fetchStats]);

  // Admin login via server endpoint
  const loginAdmin = async (password: string): Promise<boolean> => {
    setAdminError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAdminError(data.error || 'Nieprawidłowy kod dostępu.');
        return false;
      }

      const token = data.token;
      setAdminToken(token);
      setIsAdmin(true);
      sessionStorage.setItem('jmoon_adm_token', token);

      // Immediately fetch admin reviews with token
      const reviewsRes = await fetch('/api/reviews', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        if (reviewsData && Array.isArray(reviewsData.reviews)) {
          setAdminReviews(reviewsData.reviews);
          setReviews(reviewsData.reviews.filter((r: Review) => r.published));
        }
      }

      // Fetch stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.stats) setAdminStats(statsData.stats);
      }

      return true;
    } catch (err) {
      console.error('[Admin] Login error:', err);
      setAdminError('Błąd połączenia z serwerem. Spróbuj ponownie.');
      return false;
    }
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    setIsAdmin(false);
    setAdminStats(null);
    sessionStorage.removeItem('jmoon_adm_token');
    fetchReviews();
  };

  // Create Review
  const createReviewAction = async (reviewData: {
    name: string;
    service: ServiceType;
    rating: number;
    text: string;
    date?: string;
    published: boolean;
  }): Promise<{ success: boolean; message?: string }> => {
    if (!adminToken) return { success: false, message: 'Brak autoryzacji.' };
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(reviewData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.error || 'Błąd podczas dodawania opinii.' };
      }

      await fetchReviews();
      await fetchStats();
      return { success: true, message: 'Opinia została dodana.' };
    } catch {
      return { success: false, message: 'Błąd połączenia z serwerem.' };
    }
  };

  // Update Review
  const updateReviewAction = async (
    id: string,
    reviewData: Partial<Omit<Review, 'id'>>
  ): Promise<{ success: boolean; message?: string }> => {
    if (!adminToken) return { success: false, message: 'Brak autoryzacji.' };
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(reviewData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.error || 'Błąd podczas aktualizacji opinii.' };
      }

      await fetchReviews();
      await fetchStats();
      return { success: true, message: 'Opinia została zaktualizowana.' };
    } catch {
      return { success: false, message: 'Błąd połączenia z serwerem.' };
    }
  };

  // Toggle publish status
  const togglePublishReview = async (
    id: string,
    currentStatus: boolean
  ): Promise<{ success: boolean }> => {
    return updateReviewAction(id, { published: !currentStatus });
  };

  // Delete Review
  const deleteReviewAction = async (id: string): Promise<{ success: boolean; message?: string }> => {
    if (!adminToken) return { success: false, message: 'Brak autoryzacji.' };
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.error || 'Błąd podczas usuwania opinii.' };
      }

      await fetchReviews();
      await fetchStats();
      return { success: true, message: 'Opinia została usunięta.' };
    } catch {
      return { success: false, message: 'Błąd połączenia z serwerem.' };
    }
  };

  // Calculate public summary metrics
  const totalPublishedCount = reviews.length;
  const sumRatings = reviews.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = totalPublishedCount > 0 ? Number((sumRatings / totalPublishedCount).toFixed(1)) : 5.0;

  const getReviewsByService = useCallback(
    (service: ServiceType) => {
      return reviews.filter((r) => r.service === service);
    },
    [reviews]
  );

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        isLoading,
        totalPublishedCount,
        averageRating,
        getReviewsByService,
        isAdmin,
        adminReviews,
        adminStats,
        adminError,
        loginAdmin,
        logoutAdmin,
        createReview: createReviewAction,
        updateReview: updateReviewAction,
        deleteReview: deleteReviewAction,
        togglePublishReview,
        refreshReviews: fetchReviews,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
};

export function useReviews(): ReviewsContextType {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
}
