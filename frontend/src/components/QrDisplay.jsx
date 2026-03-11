import { useRef } from 'react';

export default function QrDisplay({ qrDataUrl, userName, scanUrl }) {
  const imgRef = useRef();

  const download = () => {
    const link = document.createElement('a');
    link.href     = qrDataUrl;
    link.download = `qr-${(userName || 'user').toLowerCase().replace(/\s+/g, '-')}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-6 animate-scale-in">
      {/* QR frame */}
      <div className="relative">
        <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-brand-500/20 to-accent/20 blur-xl" />
        <div className="relative bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
          {/* Corner decorators */}
          {['top-0 left-0', 'top-0 right-0 rotate-90', 'bottom-0 right-0 rotate-180', 'bottom-0 left-0 -rotate-90'].map((cls, i) => (
            <div key={i} className={`absolute ${cls} w-6 h-6`}>
              <svg viewBox="0 0 24 24" fill="none" className="text-brand-600 w-full h-full">
                <path d="M2 12V2h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}
          <img
            ref={imgRef}
            src={qrDataUrl}
            alt={`QR code for ${userName}`}
            className="w-52 h-52 rounded-lg"
          />
        </div>
      </div>

      {/* User info */}
      {userName && (
        <div className="text-center">
          <p className="font-display font-bold text-xl text-gray-900">{userName}</p>
          <p className="text-xs text-gray-400 mt-1 font-mono break-all max-w-xs">{scanUrl}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={download} className="btn-primary gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PNG
        </button>
        <button
          onClick={() => { navigator.clipboard.writeText(scanUrl); }}
          className="btn-outline gap-2"
          title="Copy scan URL"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy URL
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center max-w-xs">
        Print or save this QR code. Scan it daily to log your attendance.
      </p>
    </div>
  );
}
