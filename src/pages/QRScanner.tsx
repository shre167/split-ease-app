import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = () => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText: string) => {
        console.log('QR Code:', decodedText);

        if (decodedText.startsWith('upi://')) {
          // Redirect to UPI payment app
          window.location.href = decodedText;
        } else {
          alert('Invalid QR Code. Please scan a valid UPI QR.');
        }
      },
      (error: string) => {
        console.warn('QR Scan Error:', error);
      }
    );

    return () => {
      scanner.clear().catch(err => console.error('QR Scanner cleanup error:', err));
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-xl font-semibold mb-6 text-purple-700">Scan UPI QR Code</h1>
      <div id="reader" className="w-full max-w-md" />
    </div>
  );
};

export default QRScanner;
