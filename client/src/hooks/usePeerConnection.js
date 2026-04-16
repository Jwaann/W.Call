import { useRef, useEffect, useCallback } from 'react';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stunserver.stunprotocol.org:3478' },
    { urls: 'stun:stun.services.mozilla.com:3478' },
  ],
};

export default function usePeerConnection(socket, callStatus, setCallStatus, activeCallPeer, myPeerId) {
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const remoteCallPeerRef = useRef(null);

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
    };
  }, []);

  // Setup socket event listeners for WebRTC signaling
  useEffect(() => {
    const handleOffer = async (payload) => {
      const { from, sdp } = payload;
      remoteCallPeerRef.current = from;
      try {
        if (!pcRef.current) {
          createPeerConnection();
        }
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socket.emit('answer', {
          from: myPeerId,
          to: from,
          sdp: answer,
        });
        console.log('[WebRTC] Answer sent');
      } catch (err) {
        console.error('[WebRTC] Offer handling error:', err);
      }
    };

    const handleAnswer = async (payload) => {
      const { sdp } = payload;
      try {
        if (pcRef.current && pcRef.current.signalingState === 'have-local-offer') {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
          console.log('[WebRTC] Answer received');
        }
      } catch (err) {
        console.error('[WebRTC] Answer handling error:', err);
      }
    };

    const handleIceCandidate = async (payload) => {
      const { candidate } = payload;
      try {
        if (pcRef.current && candidate) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('[WebRTC] ICE candidate error:', err);
      }
    };

    const handleHangUp = () => {
      closeConnection();
      setCallStatus('idle');
    };

    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('hang-up', handleHangUp);

    return () => {
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('hang-up', handleHangUp);
    };
  }, [socket, setCallStatus, myPeerId]);

  const createPeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
    }

    pcRef.current = new RTCPeerConnection(RTC_CONFIG);

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pcRef.current.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote stream
    pcRef.current.ontrack = (event) => {
      console.log('[WebRTC] Remote track received');
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    pcRef.current.onicecandidate = (event) => {
      if (event.candidate && remoteCallPeerRef.current && myPeerId) {
        console.log('[WebRTC] ICE candidate:', event.candidate.candidate.substring(0, 50));
        socket.emit('ice-candidate', {
          from: myPeerId,
          to: remoteCallPeerRef.current,
          candidate: event.candidate,
        });
      } else if (!event.candidate) {
        console.log('[WebRTC] ICE gathering complete');
      }
    };

    // Monitor connection state
    pcRef.current.oniceconnectionstatechange = () => {
      const state = pcRef.current?.iceConnectionState;
      console.log('[WebRTC] ICE connection state:', state);

      if (state === 'connected' || state === 'completed') {
        setCallStatus('connected');
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        setCallStatus('disconnected');
        setTimeout(() => {
          closeConnection();
          setCallStatus('idle');
        }, 2000);
      }
    };

    // Log connection state changes
    pcRef.current.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pcRef.current?.connectionState);
    };

    console.log('[WebRTC] Peer connection created');
  }, [socket, setCallStatus, myPeerId]);

  const startCall = useCallback(
    async (remotePeerId) => {
      try {
        remoteCallPeerRef.current = remotePeerId;
        createPeerConnection();

        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);

        socket.emit('offer', {
          from: myPeerId,
          to: remotePeerId,
          sdp: offer,
        });
        console.log('[WebRTC] Offer sent to', remotePeerId);
      } catch (err) {
        console.error('[WebRTC] Error creating offer:', err);
      }
    },
    [createPeerConnection, socket, myPeerId]
  );

  const acceptCall = useCallback(
    async (remotePeerId) => {
      try {
        remoteCallPeerRef.current = remotePeerId;
        createPeerConnection();
        console.log('[WebRTC] Ready to receive offer from', remotePeerId);
      } catch (err) {
        console.error('[WebRTC] Error accepting call:', err);
      }
    },
    [createPeerConnection]
  );

  const toggleMute = useCallback((muted) => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }, []);

  const closeConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
      remoteCallPeerRef.current = null;
      console.log('[WebRTC] Peer connection closed');
    }
  }, []);

  const hangUp = useCallback(() => {
    closeConnection();
  }, [closeConnection]);

  return {
    current: pcRef.current,
    remoteAudioRef,
    audioLevelNode: analyserRef.current,
    startCall,
    acceptCall,
    hangUp,
    toggleMute,
    closeConnection,
  };
}
