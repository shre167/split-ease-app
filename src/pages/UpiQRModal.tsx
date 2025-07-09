// components/UpiQRModal.tsx
import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const UpiQRModal = ({ isOpen, onClose }: Props) => {
  const [amount, setAmount] = useState("");
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (scanning) startScanner();

    return () => stopScanner();
  }, [scanning]);

  const startScanner = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute("playsinline", "true");
      videoRef.current.play();
    }
    streamRef.current = stream;
    scanLoop();
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const scanLoop = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const video = videoRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);

      if (imageData) {
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleQRScanned(code.data);
        }
      }
    }

    requestAnimationFrame(scanLoop);
  };

  const handleQRScanned = (data: string) => {
    try {
      const url = new URL(data);
      const upiId = url.searchParams.get("pa");
      if (upiId && amount) {
        stopScanner();
        const upiUrl = `upi://pay?pa=${upiId}&pn=SplitEase&am=${amount}&cu=INR&tn=SplitEase%20Payment`;
        window.location.href = upiUrl;
      } else {
        alert("Invalid UPI QR or missing amount.");
      }
    } catch {
      alert("Failed to read QR data.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative">
        <h2 className="text-xl font-bold mb-4">Pay with QR</h2>

        {!scanning ? (
          <>
            <label className="text-sm mb-2 block">Enter Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Eg. 250"
              className="w-full border px-3 py-2 rounded mb-4"
            />

            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">
                Cancel
              </button>
              <button
                disabled={!amount}
                onClick={() => setScanning(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Scan QR
              </button>
            </div>
          </>
        ) : (
          <>
            <video ref={videoRef} className="w-full rounded mb-4" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex justify-between">
              <button
                onClick={() => {
                  stopScanner();
                  setScanning(false);
                }}
                className="text-blue-600 underline text-sm"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UpiQRModal;
