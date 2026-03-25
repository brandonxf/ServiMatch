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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h3 className="font-extrabold text-gray-900 text-lg">Calificar a {workerName}</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-semibold text-gray-700">¿Qué te pareció el servicio?</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    size={36}
                    className={`transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-500'
                        : 'text-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {rating === 1 && 'Muy malo'}
              {rating === 2 && 'Malo'}
              {rating === 3 && 'Regular'}
              {rating === 4 && 'Bueno'}
              {rating === 5 && '¡Excelente!'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Comentario (opcional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe tu opinión sobre el trabajo realizado..."
              className="input w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 resize-none h-28"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full btn-primary py-3.5 text-base rounded-xl font-bold flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Spinner size={20} /> Enviando...</>
            ) : (
              'Enviar Calificación'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
