'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

export default function PixelRatingModal({ onSubmit, onCancel }: { onSubmit: (rating: number) => void, onCancel: () => void }) {
  const [rating, setRating] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-retro-black pixel-border p-8 text-center max-w-md w-full">
        <h2 className="text-3xl text-retro-purple mb-6">RATE REPOSITORY</h2>
        <div className="flex justify-center gap-4 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`transition-colors ${rating >= star ? 'text-retro-green' : 'text-gray-600 hover:text-retro-purple'}`}
            >
              <Star className="w-12 h-12 fill-current" />
            </button>
          ))}
        </div>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 bg-gray-800 text-white px-4 py-3 pixel-border hover:bg-gray-700">
            CANCEL
          </button>
          <button
            onClick={() => onSubmit(rating)}
            disabled={rating === 0}
            className="flex-1 bg-retro-green text-black px-4 py-3 pixel-shadow-green pixel-shadow-green-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SUBMIT SCORE
          </button>
        </div>
      </div>
    </div>
  );
}
