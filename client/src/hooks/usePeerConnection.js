import { useRef, useEffect, useCallback } from 'react';

// Audio relay through Socket.io instead of WebRTC P2P
// This works through Railway because Socket.io is already working!
export default function usePeerConnection(socket, callStatus, setCallStatus, activeCallPeer, myPeerId) {
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const remoteCallPeerRef = useRef(null);
  const audioBufferRef = useRef([]);

  // Initialize local media stream and audio context on mount
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;

        // Setup audio analysis for mic level visualization
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        console.log('[Media] Local stream acquired');
      } catch (err) {
        console.error('[Media] Failed to get user media:', err);
        alert('Microphone permission denied. Please enable microphone access.');
      }
    };

    initMedia();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Setup socket listeners for audio relay and call signaling
  useEffect(() => {
    const handleAudioData = (payload) => {
      const { data } = payload;
      // Convert base64 back to audio data
      const binary = atob(data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      audioBufferRef.current.push(bytes);
    };

    const handleHangUp = () => {
      stopAudioRelay();
      setCallStatus('idle');
    };

    socket.on('audio-data', handleAudioData);
    socket.on('hang-up', handleHangUp);

    return () => {
      socket.off('audio-data', handleAudioData);
      socket.off('hang-up', handleHangUp);
    };
  }, [socket, setCallStatus]);

  // Start recording and streaming audio
  const startAudioRelay = useCallback(() => {
    if (!localStreamRef.current || !remoteCallPeerRef.current) return;

    const mediaRecorder = new MediaRecorder(localStreamRef.current, {
      audioBitsPerSecond: 16000,
    });

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        socket.emit('audio-data', {
          to: remoteCallPeerRef.current,
          from: myPeerId,
          data: base64,
        });
      };
      reader.readAsDataURL(event.data);
    };

    mediaRecorder.start(100); // Record in 100ms chunks
    console.log('[Audio] Relay started');
  }, [socket, myPeerId]);

  const stopAudioRelay = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      console.log('[Audio] Relay stopped');
    }
  }, []);

  // Play received audio
  useEffect(() => {
    if (audioBufferRef.current.length === 0) return;

    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    // Resume audio context if suspended (required after user interaction)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const bytes = audioBufferRef.current.shift();
    const blob = new Blob([bytes], { type: 'audio/webm' });

    // Decode the audio blob properly
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
      }, (err) => {
        console.error('[Audio] Decode error:', err);
      });
    };
    reader.readAsArrayBuffer(blob);
  }, [audioBufferRef.current.length]);

  const startCall = useCallback(
    (remotePeerId) => {
      remoteCallPeerRef.current = remotePeerId;
      setCallStatus('connecting');
      setTimeout(() => {
        startAudioRelay();
        setCallStatus('connected');
      }, 500);
      console.log('[Audio] Call started');
    },
    [startAudioRelay, setCallStatus]
  );

  const acceptCall = useCallback(
    (remotePeerId) => {
      remoteCallPeerRef.current = remotePeerId;
      setCallStatus('connecting');
      setTimeout(() => {
        startAudioRelay();
        setCallStatus('connected');
      }, 500);
      console.log('[Audio] Call accepted');
    },
    [startAudioRelay, setCallStatus]
  );

  const toggleMute = useCallback((muted) => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }, []);

  const hangUp = useCallback(() => {
    stopAudioRelay();
  }, [stopAudioRelay]);

  return {
    current: null,
    remoteAudioRef,
    audioLevelNode: analyserRef.current,
    startCall,
    acceptCall,
    hangUp,
    toggleMute,
    closeConnection: hangUp,
  };
}
