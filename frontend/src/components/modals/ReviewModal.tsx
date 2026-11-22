import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Spinner } from '../ui/Spinner';
import { toast } from 'sonner';
import { reviewsApi } from '@/lib/api/reviews';

interface Props {
  requestId: string;
  workerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({ requestId, workerName, onClose, onSuccess }: Props) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewsApi.create({ requestId, rating, comment });
      toast.success('¡Reseña enviada con éxito!');
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Error al enviar la reseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="review-title" className="w-full max-w-md bg-paper border-2 border-ink shadow-brutal-lg">
        <div className="flex justify-between items-center p-4 border-b-2 border-ink bg-signal">
          <h3 id="review-title" className="font-display font-bold text-lg uppercase tracking-tight">Calificar a {workerName}</h3>
          <button onClick={onClose} aria-label="Cerrar" className="size-11 flex items-center justify-center border-2 border-ink bg-white hover:bg-ink hover:text-signal transition-colors">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <fieldset className="flex flex-col items-center gap-3">
            <legend className="label text-center">¿Qué te pareció el servicio?</legend>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
                  aria-pressed={rating === star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="size-12 flex items-center justify-center transition-transform hover:scale-110 motion-reduce:transform-none"
                >
                  <Star
                    size={36}
                    strokeWidth={2.25}
                    aria-hidden="true"
                    className={star <= (hoveredRating || rating) ? 'fill-signal text-ink' : 'fill-white text-ink'}
                  />
                </button>
              ))}
            </div>
            <p aria-live="polite" className="font-mono text-xs font-bold uppercase tracking-wider min-h-4">
              {rating === 1 && 'Muy malo'}
              {rating === 2 && 'Malo'}
              {rating === 3 && 'Regular'}
              {rating === 4 && 'Bueno'}
              {rating === 5 && '¡Excelente!'}
            </p>
          </fieldset>

          <div>
            <label htmlFor="review-comment" className="label">Comentario (opcional)</label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe tu opinión sobre el trabajo realizado..."
              className="input resize-none h-28"
            />
          </div>

          <button onClick={handleSubmit} disabled={isSubmitting} className="w-full btn-primary py-3.5 text-base">
            {isSubmitting ? (
              <><Spinner size={20} /> Enviando...</>
            ) : (
              'Enviar calificación'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
