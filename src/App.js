import React, { useEffect, useRef, useState } from 'react';
import { Camera, Mic, Radio, Volume2, VolumeX  } from 'lucide-react';

const MediaCaptureApp = () => {
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState('instruct');
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        // Initialize video only for the camera feed
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false  // Don't initialize audio here
        });
        setStream(videoStream);
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
        }
      } catch (err) {
        setError("Failed to access camera. Please ensure permissions are granted.");
        console.error("Error accessing camera:", err);
      }
    };

    initializeMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      return canvas.toDataURL('image/jpeg').split(',')[1];
    }
    return null;
  };

  const base64ToAudio = (base64Audio) => {
    const binaryString = window.atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: 'audio/wav' });
  };

  const playAudio = async (base64Audio) => {
    try {
      const audioBlob = base64ToAudio(base64Audio);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      setIsPlaying(true);
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (err) {
      setError("Error playing audio response");
      console.error("Error playing audio:", err);
      setIsPlaying(false);
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      // Get audio stream only when recording starts
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      
      setIsRecording(true);
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(audioStream);

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        // Stop and remove the audio stream immediately
        audioStream.getTracks().forEach(track => track.stop());
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64Audio = reader.result.split(',')[1];
          const base64Image = captureImage();
          
          try {
            const response = await fetch('https://aa4b-84-14-112-188.ngrok-free.app/process', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                image: base64Image,
                sound: base64Audio,
                mode: mode
              }),
            });
            
            if (!response.ok) {
              throw new Error(`Server responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.audio_b64) {
              playAudio(data.audio_b64);
            } else {
              throw new Error('No audio received from server');
            }
          } catch (err) {
            setError("Failed to process recording. Please try again.");
            console.error("Error sending request:", err);
          }
        };
        
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
    } catch (err) {
      setError("Failed to access microphone. Please ensure permissions are granted.");
      console.error("Error starting recording:", err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-6 shadow-2xl">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Camera className="w-6 h-6" />
              Media Capture Studio
            </h1>
            
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Mode:</span>
              <button
                onClick={() => setMode(mode === 'instruct' ? 'allaround' : 'instruct')}
                className={`relative inline-flex h-6 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none
                  ${mode === 'instruct' ? 'bg-blue-600' : 'bg-purple-600'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                    ${mode === 'instruct' ? 'translate-x-2' : 'translate-x-10'}`}
                />
                <span className="sr-only">Toggle Mode</span>
              </button>
              <span className="text-white text-sm font-medium">
                {mode === 'instruct' ? 'Instruct' : 'All Around'}
              </span>
            </div>
          </div>
          
          <div className="relative rounded-lg overflow-hidden bg-black mb-6 shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-[480px] object-cover"
            />
            
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full">
              <div className={`w-2 h-2 rounded-full ${stream ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-white text-sm">{stream ? 'Live' : 'No Camera'}</span>
            </div>

            {isRecording && (
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-red-500/80 px-3 py-1.5 rounded-full animate-pulse">
                <Mic className="w-4 h-4 text-white" />
                <span className="text-white text-sm">Recording...</span>
              </div>
            )}
            
            {isPlaying && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-green-500/80 px-3 py-1.5 rounded-full animate-pulse">
                <Volume2 className="w-4 h-4 text-white" />
                <span className="text-white text-sm">Playing Response...</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h2 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                <Radio className="w-4 h-4" />
                Current Mode
              </h2>
              <p className="text-gray-300 text-sm capitalize">
                {mode} Mode Active
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h2 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                Audio Status
              </h2>
              <p className="text-gray-300 text-sm">
                {isPlaying ? 'Playing response...' : 'Ready for input'}
              </p>
            </div>
          </div>

          <button
            className={`w-full py-4 rounded-lg font-medium transition-all duration-200 shadow-lg ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25'
                : mode === 'instruct'
                ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/25'
                : 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/25'
            } text-white touch-none select-none`}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            onTouchCancel={stopRecording}
          >
            {isRecording ? 'Release to Send Recording' : 'Hold to Record Message'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaCaptureApp;