import { useRef, useState} from "react";
import Webcam from "react-webcam";

interface Props {
  onCapture: (file: File, previewUrl: string, thumbUrl?:string) => void;
  onCancel: () => void;
}

export default function CameraCaptureOverlay({ onCapture, onCancel }: Props) {
  const webcamRef = useRef<Webcam>(null);
  // const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  // const [currentIndex, setCurrentIndex] = useState(0);
  const [capturing, setCapturing] = useState(false);

  // Get available cameras
  // useEffect(() => {
  //   async function loadDevices() {
  //     try {
  //       // const all = await navigator.mediaDevices.enumerateDevices();
  //       // const videoInputs = all.filter((d) => d.kind === "videoinput");
  //       // setDevices(videoInputs);

  //       // Prefer first back camera
  //       // const envIndex = videoInputs.findIndex((d) =>
  //       //   d.label.toLowerCase().includes("back")
  //       // );
  //       // if (envIndex >= 0) setCurrentIndex(envIndex);
  //     } catch (err) {
  //       console.error("Error loading cameras:", err);
  //     }
  //   }
  //   loadDevices();
  // }, []);

  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  const videoConstraints: MediaTrackConstraints = {
    facingMode: facingMode,
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  };

  const handleCapture = async () => {
    if (capturing) return;
    setCapturing(true);

    try {
      const video = webcamRef.current?.video as HTMLVideoElement | undefined;
      if (!video) return;

      // Use track settings for full native resolution
      // const track = (video.srcObject as MediaStream)
        // ?.getVideoTracks?.()[0];
      // const settings = track?.getSettings();
      const width = video.videoWidth;
      const height = video.videoHeight;

      // Draw frame to canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);

        const fullBlob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", 1)
        );
        if (!fullBlob) {
          return;
          
        }
        const fullFile = new File([fullBlob], "capture.jpg", { type: "image/jpeg" });
        const previewUrl = URL.createObjectURL(fullBlob);

        //now make the thumbnail
        const thumbWidth = 120;
        const thumbHeight = Math.round((thumbWidth / width) * height);

        const thumbCanvas = document.createElement("canvas");
        thumbCanvas.width = thumbWidth;
        thumbCanvas.height = thumbHeight;
        const thumbCtx = thumbCanvas.getContext("2d");
        thumbCtx?.drawImage(video, 0, 0, thumbWidth, thumbHeight);

        const thumbBlob = await new Promise<Blob | null>((resolve) =>
          thumbCanvas.toBlob(resolve, "image/jpeg", 0.7)
      );

      let thumbUrl: string | null = null;
      if (thumbBlob) {
        thumbUrl = URL.createObjectURL(thumbBlob);
      }

        onCapture(fullFile, previewUrl, thumbUrl || previewUrl);

        onCancel();

      }
    } catch (err) {
      console.error("Error capturing photo:", err);
    }
  };

  const handleSwitchCamera = () => {
    // if (devices.length > 1) {
    //   setCurrentIndex((prev) => (prev + 1) % devices.length);
    // }
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    <div className="camera-overlay fixed inset-0 z-50 bg-black flex flex-col">
      {/* Camera feed */}
      <div className="flex-1 flex items-center justify-center">
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={videoConstraints}
          forceScreenshotSourceSize
          className="w-full h-full object-cover"
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-16">
        {/* Cancel */}
        <button
          onClick={onCancel}
          className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center"
        >
          <i className="fas fa-times text-white text-xl" />
        </button>

        {/* Shutter */}
        <button
          onClick={handleCapture}
          disabled={capturing}
          className={`w-16 h-16 rounded-full border-4 relative ${
            capturing
              ? "border-gray-400 bg-gray-400"
              : "border-white bg-white/90"
          } active:scale-95 transition-transform`}
        >
          {capturing && (
            <span className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-spinner fa-spin text-white text-xl" />
            </span>
          )}
        </button>

        {/* Switch Camera */}
        <button
          onClick={handleSwitchCamera}
          disabled={capturing}
          className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center"
        >
          <i className="fas fa-sync text-white text-xl" />
        </button>
      </div>
    </div>
  );
}
