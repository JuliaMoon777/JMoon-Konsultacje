import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Plus, CheckCircle2, AlertTriangle, LogOut, ArrowLeft, Eye, EyeOff, Trash2, Edit3 } from 'lucide-react';
import { useReviews } from '../context/ReviewsContext';
import { Review, ServiceType } from '../types';

const SERVICES: ServiceType[] = [
  'KODY CIAŁA',
  'Indywidualna prognoza miesiąca',
  'EKSPRESOWA ANALIZA MATRYCY LOSU',
];

interface AdminReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminReviewsModal: React.FC<AdminReviewsModalProps> = ({ isOpen, onClose }) => {
  const {
    isAdmin,
    loginAdmin,
    logoutAdmin,
    adminReviews,
    adminStats,
    adminError,
    createReview,
    updateReview,
    deleteReview,
    togglePublishReview,
  } = useReviews();

  // Login form state
  const [accessCode, setAccessCode] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin view state: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    service: ServiceType;
    rating: number;
    text: string;
    published: boolean;
  }>({
    name: '',
    service: 'EKSPRESOWA ANALIZA MATRYCY LOSU',
    rating: 5,
    text: '',
    published: true,
  });

  const [formFeedback, setFormFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation modal state
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle Admin Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;
    setIsLoggingIn(true);
    const success = await loginAdmin(accessCode);
    setIsLoggingIn(false);
    if (success) {
      setAccessCode('');
      setViewMode('list');
    }
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setFormData({
      name: '',
      service: 'EKSPRESOWA ANALIZA MATRYCY LOSU',
      rating: 5,
      text: '',
      published: true,
    });
    setFormFeedback(null);
    setViewMode('create');
  };

  // Open Edit Form
  const handleOpenEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      name: review.name || review.author || '',
      service: review.service,
      rating: review.rating,
      text: review.text,
      published: review.published,
    });
    setFormFeedback(null);
    setViewMode('edit');
  };

  // Submit Form (Create or Edit)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormFeedback({ type: 'error', message: 'Wprowadź imię.' });
      return;
    }
    if (!formData.text.trim()) {
      setFormFeedback({ type: 'error', message: 'Wprowadź treść opinii.' });
      return;
    }

    setIsSubmitting(true);
    setFormFeedback(null);

    if (viewMode === 'create') {
      const res = await createReview({
        name: formData.name,
        service: formData.service,
        rating: formData.rating,
        text: formData.text,
        published: formData.published,
      });

      setIsSubmitting(false);
      if (res.success) {
        setFormFeedback({ type: 'success', message: 'Opinia została dodana.' });
        setTimeout(() => {
          setViewMode('list');
          setFormFeedback(null);
        }, 1200);
      } else {
        setFormFeedback({ type: 'error', message: res.message || 'Wystąpił błąd.' });
      }
    } else if (viewMode === 'edit' && editingReview) {
      const res = await updateReview(editingReview.id, {
        name: formData.name,
        service: formData.service,
        rating: formData.rating,
        text: formData.text,
        published: formData.published,
      });

      setIsSubmitting(false);
      if (res.success) {
        setFormFeedback({ type: 'success', message: 'Opinia została zaktualizowana.' });
        setTimeout(() => {
          setViewMode('list');
          setFormFeedback(null);
          setEditingReview(null);
        }, 1200);
      } else {
        setFormFeedback({ type: 'error', message: res.message || 'Wystąpił błąd.' });
      }
    }
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);
    await deleteReview(reviewToDelete.id);
    setIsDeleting(false);
    setReviewToDelete(null);
  };

  if (!isOpen) return null;

  return (
    <div
      id="admin-reviews-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Panel opinii"
    >
      <AnimatePresence mode="wait">
        {/* ======================================================== */}
        {/* CASE A: UNATHENTICATED -> SMALL "PANEL OPINII" LOGIN MODAL */}
        {/* ======================================================== */}
        {!isAdmin ? (
          <motion.div
            key="login-modal"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md rounded-2xl bg-[#17110E] border border-[#E6B491]/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6 sm:p-8 relative text-[#F8F4F0]"
          >
            {/* Close Button */}
            <button
              type="button"
              id="admin-login-close-btn"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[#CFBFB6]/60 hover:text-[#F8F4F0] transition-colors rounded-lg"
              aria-label="Zamknij"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <span className="font-title text-xs uppercase tracking-[0.2em] text-[#D17A52] font-semibold">
                Dostęp administracyjny
              </span>
              <h2 className="font-title text-xl sm:text-2xl text-[#F8F4F0] mt-1 font-normal tracking-wide">
                Panel opinii
              </h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="admin-access-code"
                  className="block font-title text-xs uppercase tracking-[0.16em] text-[#E8B58E] mb-2 font-medium"
                >
                  Kod dostępu
                </label>
                <input
                  id="admin-access-code"
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Wprowadź kod..."
                  autoFocus
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-[#E6B491]/20 focus:border-[#E8B58E] focus:outline-none focus:ring-1 focus:ring-[#E8B58E] text-[#F8F4F0] placeholder-[#CFBFB6]/40 text-sm font-body transition-colors"
                />
              </div>

              {adminError && (
                <div
                  id="admin-login-error"
                  className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-body flex items-center gap-2"
                >
                  <AlertTriangle size={14} className="shrink-0 text-red-400" />
                  <span>{adminError}</span>
                </div>
              )}

              <button
                type="submit"
                id="admin-login-submit-btn"
                disabled={isLoggingIn || !accessCode.trim()}
                className="w-full py-3.5 px-6 rounded-xl bg-[#D17A52] hover:bg-[#b86742] disabled:opacity-50 disabled:cursor-not-allowed font-title text-xs uppercase tracking-[0.2em] text-[#F8F4F0] font-semibold transition-colors duration-200 shadow-lg shadow-[#D17A52]/20"
              >
                {isLoggingIn ? 'Weryfikacja...' : 'Zaloguj'}
              </button>
            </form>
          </motion.div>
        ) : (
          /* ======================================================== */
          /* CASE B: AUTHENTICATED -> FULL ADMIN MANAGEMENT DASHBOARD */
          /* ======================================================== */
          <motion.div
            key="admin-dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl sm:rounded-3xl bg-[#140E0C] border border-[#E6B491]/20 shadow-[0_24px_70px_rgba(0,0,0,0.8)] overflow-hidden text-[#F8F4F0]"
          >
            {/* Top Bar */}
            <div className="px-5 sm:px-8 py-5 border-b border-[#E6B491]/15 flex items-center justify-between gap-4 shrink-0 bg-[#19120F]">
              <div className="flex items-center gap-3">
                {viewMode !== 'list' && (
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('list');
                      setFormFeedback(null);
                    }}
                    className="p-2 -ml-2 text-[#CFBFB6]/80 hover:text-[#F8F4F0] transition-colors rounded-lg"
                    title="Wróć do listy"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                <div>
                  <h2 className="font-title text-base sm:text-xl text-[#F8F4F0] font-normal tracking-wide">
                    Panel Zarządzania Opiniami
                  </h2>
                  <p className="font-body text-xs text-[#CFBFB6]/70 hidden sm:block">
                    J.Moon Numerology • Moderacja i edycja opinii
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {viewMode === 'list' && (
                  <button
                    type="button"
                    id="admin-add-review-btn"
                    onClick={handleOpenCreate}
                    className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-[#D17A52] hover:bg-[#b86742] text-[#F8F4F0] font-title text-xs uppercase tracking-[0.15em] font-semibold transition-colors duration-200"
                  >
                    <Plus size={14} />
                    <span>+ Dodaj opinię</span>
                  </button>
                )}

                <button
                  type="button"
                  id="admin-logout-btn"
                  onClick={logoutAdmin}
                  className="p-2 text-[#CFBFB6]/70 hover:text-red-300 transition-colors rounded-lg"
                  title="Wyloguj się"
                >
                  <LogOut size={17} />
                </button>

                <button
                  type="button"
                  id="admin-modal-close-btn"
                  onClick={onClose}
                  className="p-2 text-[#CFBFB6]/70 hover:text-[#F8F4F0] transition-colors rounded-lg"
                  title="Zamknij okno"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            {/* Scrollable Dashboard Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 sm:space-y-8">
              {/* ========================================== */}
              {/* SECTION 7: STATYSTYKA                      */}
              {/* ========================================== */}
              {adminStats && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-[#E6B491]/12">
                      <span className="block font-title text-[11px] uppercase tracking-[0.18em] text-[#CFBFB6]/70 mb-1">
                        Liczba opinii
                      </span>
                      <span className="font-title text-xl sm:text-2xl font-semibold text-[#F8F4F0]">
                        {adminStats.total}
                      </span>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-[#E6B491]/12">
                      <span className="block font-title text-[11px] uppercase tracking-[0.18em] text-[#CFBFB6]/70 mb-1">
                        Opublikowane
                      </span>
                      <span className="font-title text-xl sm:text-2xl font-semibold text-emerald-400">
                        {adminStats.published}
                      </span>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-[#E6B491]/12">
                      <span className="block font-title text-[11px] uppercase tracking-[0.18em] text-[#CFBFB6]/70 mb-1">
                        Ukryte
                      </span>
                      <span className="font-title text-xl sm:text-2xl font-semibold text-[#D17A52]">
                        {adminStats.hidden}
                      </span>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-[#E6B491]/12">
                      <span className="block font-title text-[11px] uppercase tracking-[0.18em] text-[#CFBFB6]/70 mb-1">
                        Średnia ocena
                      </span>
                      <div className="flex items-center gap-1.5 font-title text-xl sm:text-2xl font-semibold text-[#E8B58E]">
                        <span>{adminStats.averageRating.toFixed(1)}</span>
                        <Star size={16} className="fill-[#E8B58E] text-[#E8B58E]" />
                      </div>
                    </div>
                  </div>

                  {/* Breakdown per service */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-[#E6B491]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="font-title uppercase tracking-[0.14em] text-[#CFBFB6]/80 text-[11px]">
                      Wg usług:
                    </span>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 font-body text-xs text-[#E3D8D2]">
                      <span>
                        <strong className="text-[#E8B58E] font-medium">KODY CIAŁA:</strong>{' '}
                        {adminStats.byService.kodyCiala}
                      </span>
                      <span>
                        <strong className="text-[#E8B58E] font-medium">
                          Indywidualna prognoza:
                        </strong>{' '}
                        {adminStats.byService.indywidualnaPrognoza}
                      </span>
                      <span>
                        <strong className="text-[#E8B58E] font-medium">
                          Matryca Losu:
                        </strong>{' '}
                        {adminStats.byService.ekspresowaAnaliza}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* VIEW 1: LISTA WSZYSTKICH OPINII            */}
              {/* ========================================== */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-title text-sm uppercase tracking-[0.18em] text-[#E8B58E] font-medium">
                      Wszystkie opinie ({adminReviews.length})
                    </h3>
                  </div>

                  {adminReviews.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-[#E6B491]/10 text-[#CFBFB6]/60 text-sm font-body">
                      Brak opinii w bazie. Kliknij „+ Dodaj opinię”, aby dodać pierwszą.
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {adminReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-4 sm:p-5 rounded-2xl bg-white/[0.025] border border-[#E6B491]/15 hover:border-[#E6B491]/25 transition-all space-y-3"
                        >
                          {/* Top Row: Author, Status, Service */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span className="font-title text-base sm:text-lg text-[#F8F4F0] font-medium">
                                {rev.name || rev.author}
                              </span>

                              {/* Status Badge */}
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-title uppercase tracking-[0.1em] font-medium ${
                                  rev.published
                                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                                }`}
                              >
                                {rev.published ? 'Opublikowana' : 'Ukryta'}
                              </span>
                            </div>

                            {/* Stars & Rating */}
                            <div className="flex items-center gap-1.5 text-xs text-[#E8B58E]">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    size={13}
                                    className={
                                      s <= rev.rating
                                        ? 'text-[#E8B58E] fill-[#E8B58E]'
                                        : 'text-[#E8B58E]/30'
                                    }
                                  />
                                ))}
                              </div>
                              <span className="font-title text-xs font-semibold">
                                {rev.rating}/5
                              </span>
                            </div>
                          </div>

                          {/* Service Tag & Date */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#CFBFB6]/70">
                            <span className="font-title uppercase tracking-wider text-[#E8B58E]/90">
                              {rev.service}
                            </span>
                            <span>•</span>
                            <span>{rev.date}</span>
                          </div>

                          {/* Review Text */}
                          <p className="font-body text-xs sm:text-sm text-[#E3D8D2] font-light leading-relaxed whitespace-pre-line line-clamp-3">
                            {rev.text}
                          </p>

                          {/* Action Buttons: Edytuj, Ukryj/Opublikuj, Usuń */}
                          <div className="pt-2 border-t border-[#E6B491]/10 flex flex-wrap items-center justify-end gap-2 text-xs font-title">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(rev)}
                              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#E8B58E] hover:text-[#F8F4F0] border border-[#E6B491]/20 transition-colors flex items-center gap-1.5"
                            >
                              <Edit3 size={13} />
                              <span>Edytuj</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => togglePublishReview(rev.id, rev.published)}
                              className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                                rev.published
                                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border-amber-500/30'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
                              }`}
                            >
                              {rev.published ? (
                                <>
                                  <EyeOff size={13} />
                                  <span>Ukryj</span>
                                </>
                              ) : (
                                <>
                                  <Eye size={13} />
                                  <span>Opublikuj</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setReviewToDelete(rev)}
                              className="px-3 py-1.5 rounded-lg bg-red-950/20 hover:bg-red-950/40 text-red-300 hover:text-red-200 border border-red-500/25 transition-colors flex items-center gap-1.5"
                            >
                              <Trash2 size={13} />
                              <span>Usuń</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ========================================== */}
              {/* VIEW 2: FORMULARZ DODAWANIA / EDYCJI       */}
              {/* ========================================== */}
              {(viewMode === 'create' || viewMode === 'edit') && (
                <form onSubmit={handleSubmitForm} className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E6B491]/15">
                    <h3 className="font-title text-sm sm:text-base uppercase tracking-[0.16em] text-[#E8B58E] font-medium">
                      {viewMode === 'create' ? '+ Dodaj nową opinię' : 'Edytuj opinię'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('list');
                        setFormFeedback(null);
                      }}
                      className="font-title text-xs uppercase tracking-[0.15em] text-[#CFBFB6]/70 hover:text-[#F8F4F0] underline decoration-[#E6B491]/30"
                    >
                      Anuluj
                    </button>
                  </div>

                  {/* Field: IMIĘ */}
                  <div>
                    <label
                      htmlFor="form-author-name"
                      className="block font-title text-xs uppercase tracking-[0.16em] text-[#E8B58E] mb-1.5 font-medium"
                    >
                      IMIĘ <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="form-author-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="np. Agnieszka"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-[#E6B491]/20 focus:border-[#E8B58E] focus:outline-none focus:ring-1 focus:ring-[#E8B58E] text-[#F8F4F0] placeholder-[#CFBFB6]/40 text-sm font-body transition-colors"
                    />
                  </div>

                  {/* Field: USŁUGA (select) */}
                  <div>
                    <label
                      htmlFor="form-service-select"
                      className="block font-title text-xs uppercase tracking-[0.16em] text-[#E8B58E] mb-1.5 font-medium"
                    >
                      USŁUGA <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="form-service-select"
                      value={formData.service}
                      onChange={(e) =>
                        setFormData({ ...formData, service: e.target.value as ServiceType })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-[#1d1613] border border-[#E6B491]/20 focus:border-[#E8B58E] focus:outline-none focus:ring-1 focus:ring-[#E8B58E] text-[#F8F4F0] text-sm font-body transition-colors"
                    >
                      {SERVICES.map((s) => (
                        <option key={s} value={s} className="bg-[#1d1613] text-[#F8F4F0]">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Field: OCENA 1-5 gwiazdek */}
                  <div>
                    <label className="block font-title text-xs uppercase tracking-[0.16em] text-[#E8B58E] mb-1.5 font-medium">
                      OCENA (1–5 GWIAZDEK)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData({ ...formData, rating: star })}
                            className="p-1 hover:scale-110 transition-transform"
                            aria-label={`${star} gwiazdek`}
                          >
                            <Star
                              size={24}
                              className={
                                star <= formData.rating
                                  ? 'text-[#E8B58E] fill-[#E8B58E]'
                                  : 'text-[#E8B58E]/25'
                              }
                            />
                          </button>
                        ))}
                      </div>
                      <span className="font-title text-sm text-[#E8B58E] font-semibold">
                        {formData.rating}/5
                      </span>
                    </div>
                  </div>

                  {/* Field: TREŚĆ OPINII */}
                  <div>
                    <label
                      htmlFor="form-review-text"
                      className="block font-title text-xs uppercase tracking-[0.16em] text-[#E8B58E] mb-1.5 font-medium"
                    >
                      TREŚĆ OPINII <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="form-review-text"
                      rows={5}
                      value={formData.text}
                      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                      placeholder="Wprowadź treść opinii klienta..."
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-[#E6B491]/20 focus:border-[#E8B58E] focus:outline-none focus:ring-1 focus:ring-[#E8B58E] text-[#F8F4F0] placeholder-[#CFBFB6]/40 text-sm font-body leading-relaxed transition-colors resize-y"
                    />
                  </div>

                  {/* Field: STATUS Opublikowana / Ukryta */}
                  <div>
                    <label className="block font-title text-xs uppercase tracking-[0.16em] text-[#E8B58E] mb-2 font-medium">
                      STATUS
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer font-body text-sm text-[#E3D8D2]">
                        <input
                          type="radio"
                          name="reviewStatus"
                          checked={formData.published === true}
                          onChange={() => setFormData({ ...formData, published: true })}
                          className="accent-[#D17A52] w-4 h-4 cursor-pointer"
                        />
                        <span>Opublikowana</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-body text-sm text-[#E3D8D2]">
                        <input
                          type="radio"
                          name="reviewStatus"
                          checked={formData.published === false}
                          onChange={() => setFormData({ ...formData, published: false })}
                          className="accent-[#D17A52] w-4 h-4 cursor-pointer"
                        />
                        <span>Ukryta</span>
                      </label>
                    </div>
                  </div>

                  {/* Feedback Banner */}
                  {formFeedback && (
                    <div
                      id="admin-form-feedback"
                      className={`p-3.5 rounded-xl border text-xs font-body flex items-center gap-2.5 ${
                        formFeedback.type === 'success'
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                          : 'bg-red-950/40 border-red-500/30 text-red-200'
                      }`}
                    >
                      {formFeedback.type === 'success' ? (
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle size={16} className="text-red-400 shrink-0" />
                      )}
                      <span>{formFeedback.message}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      id="admin-form-submit-btn"
                      disabled={isSubmitting}
                      className="py-3.5 px-8 rounded-xl bg-[#D17A52] hover:bg-[#b86742] disabled:opacity-50 font-title text-xs uppercase tracking-[0.2em] text-[#F8F4F0] font-semibold transition-colors duration-200 shadow-lg shadow-[#D17A52]/20"
                    >
                      {isSubmitting
                        ? 'Zapisywanie...'
                        : viewMode === 'create'
                        ? 'DODAJ OPINIĘ'
                        : 'ZAPISZ ZMIANY'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('list');
                        setFormFeedback(null);
                      }}
                      className="py-3.5 px-6 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#CFBFB6] font-title text-xs uppercase tracking-[0.16em] transition-colors"
                    >
                      Anuluj
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* CONFIRM DELETE MODAL: "Czy na pewno chcesz usunąć tę opinię?" */}
      {/* ======================================================== */}
      <AnimatePresence>
        {reviewToDelete && (
          <div
            id="admin-delete-confirm-overlay"
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-[#1a1310] border border-red-500/30 p-6 shadow-2xl space-y-4 text-[#F8F4F0]"
            >
              <div className="flex items-center gap-2.5 text-red-400">
                <AlertTriangle size={20} />
                <h4 className="font-title text-base font-medium">Potwierdzenie usunięcia</h4>
              </div>

              <p className="font-body text-sm text-[#E3D8D2] leading-relaxed">
                Czy na pewno chcesz usunąć tę opinię?
              </p>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-[#E6B491]/10 text-xs font-body text-[#CFBFB6]/80">
                <span className="font-semibold text-[#F8F4F0]">{reviewToDelete.name}</span> •{' '}
                <span>{reviewToDelete.service}</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  id="admin-delete-cancel-btn"
                  onClick={() => setReviewToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-[#CFBFB6] font-title text-xs uppercase tracking-wider transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  id="admin-delete-confirm-btn"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-title text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Usuwanie...' : 'Usuń'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
