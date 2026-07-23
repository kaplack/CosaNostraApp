import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

function PizzaImageModal({ imageUrl, name, onClose }) {
  useEffect(
    function () {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      function handleKeyDown(event) {
        if (event.key === 'Escape') onClose();
      }

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = previousOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    },
    [onClose],
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/90 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ampliada de ${name}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-full w-full max-w-5xl flex-col border-[4px] border-stone-950 bg-[#fff8e8] shadow-[8px_8px_0_#d7261e]">
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="absolute -right-2 -top-2 z-10 inline-flex h-11 w-11 items-center justify-center border-[3px] border-stone-950 bg-[#f9bd16] text-2xl shadow-[3px_3px_0_#111312] transition hover:-translate-y-0.5"
          aria-label="Cerrar foto"
        >
          <FiX aria-hidden="true" />
        </button>
        <div className="min-h-0 grow bg-stone-950 p-2 sm:p-4">
          <img src={imageUrl} alt={name} className="max-h-[75vh] w-full object-contain" />
        </div>
        <p className="cn-display px-5 py-3 text-center text-2xl uppercase italic sm:text-3xl">{name}</p>
      </div>
    </div>,
    document.body,
  );
}

export default PizzaImageModal;
