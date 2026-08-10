import { useEffect, useState } from 'react';
import Bible from './Bible';

interface Props {
  open: boolean;
  reference?: string | null;
  onClose: () => void;
}

export default function BibleSheet({ open, reference, onClose }: Props) {
  const [consumed, setConsumed] = useState(false);

  useEffect(() => {
    if (open) {
      setConsumed(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const target = open && reference && !consumed ? reference : null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-0 z-50 flex flex-col bg-parchment transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}
        role="dialog"
        aria-label="Bible reader"
      >
        <Bible
          onClose={onClose}
          targetRef={target}
          onRefConsumed={() => setConsumed(true)}
        />
      </div>
    </>
  );
}
