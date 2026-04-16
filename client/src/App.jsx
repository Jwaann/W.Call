import { useState, useEffect } from 'react';
import socket from './lib/socket';
import { generatePeerId } from './lib/peerIdGen';
import PeerIdDisplay from './components/PeerIdDisplay';
import DialPad from './components/DialPad';
import CallControls from './components/CallControls';
import StatusBanner from './components/StatusBanner';
import AudioLevelBar from './components/AudioLevelBar';
import Timer from './components/Timer';
import usePeerConnection from './hooks/usePeerConnection';

export default function App() {
  const [myPeerId, setMyPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState('');
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, ringing, connecting, connected, disconnected
  const [activeCallPeer, setActiveCallPeer] = useState(null);

  const peerConnection = usePeerConnection(socket, callStatus, setCallStatus, activeCallPeer, myPeerId);

  // Initialize peer ID and register with server on mount
  useEffect(() => {
    const peerId = generatePeerId();
    setMyPeerId(peerId);
    socket.emit('register', { peerId });

    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, []);

  // Handle incoming call
  useEffect(() => {
    const handleIncomingCall = (payload) => {
      const { from } = payload;
      setActiveCallPeer(from);
      setCallStatus('ringing');
    };

    socket.on('incoming-call', handleIncomingCall);

    return () => {
      socket.off('incoming-call', handleIncomingCall);
    };
  }, []);

  // Handle call accepted by remote peer
  useEffect(() => {
    const handleCallAccepted = async (payload) => {
      const { from } = payload;
      setActiveCallPeer(from);
      setCallStatus('connecting');
      await peerConnection.startCall(from);
    };

    socket.on('call-accepted', handleCallAccepted);

    return () => {
      socket.off('call-accepted', handleCallAccepted);
    };
  }, [peerConnection, socket]);

  // Handle call rejected
  useEffect(() => {
    const handleCallRejected = () => {
      setCallStatus('idle');
      setActiveCallPeer(null);
      setRemotePeerId('');
    };

    socket.on('call-rejected', handleCallRejected);

    return () => {
      socket.off('call-rejected', handleCallRejected);
    };
  }, []);

  const handleCall = () => {
    if (!remotePeerId.trim()) return;
    setCallStatus('calling');
    socket.emit('call-request', {
      from: myPeerId,
      to: remotePeerId,
    });
  };

  const handleAcceptCall = () => {
    if (!activeCallPeer) return;
    setCallStatus('connecting');
    socket.emit('call-accept', {
      from: myPeerId,
      to: activeCallPeer,
    });
    peerConnection.acceptCall(activeCallPeer);
  };

  const handleRejectCall = () => {
    if (!activeCallPeer) return;
    socket.emit('call-reject', {
      from: myPeerId,
      to: activeCallPeer,
    });
    setCallStatus('idle');
    setActiveCallPeer(null);
  };

  const handleHangUp = () => {
    if (activeCallPeer) {
      socket.emit('hang-up', {
        from: myPeerId,
        to: activeCallPeer,
      });
    }
    peerConnection.hangUp();
    setCallStatus('idle');
    setActiveCallPeer(null);
    setRemotePeerId('');
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-neutral-900 rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-100 mb-1">W.Call</h1>
          <p className="text-sm text-neutral-400">Peer-to-peer audio calls</p>
        </div>

        {/* Status Banner */}
        <StatusBanner status={callStatus} />

        {/* Peer ID Display */}
        {myPeerId && <PeerIdDisplay peerId={myPeerId} />}

        {/* Call Status-based UI */}
        {callStatus === 'idle' && (
          <>
            <DialPad
              remotePeerId={remotePeerId}
              onRemotePeerIdChange={setRemotePeerId}
              onCall={handleCall}
            />
          </>
        )}

        {callStatus === 'ringing' && (
          <div className="space-y-3">
            <p className="text-sm text-neutral-400">
              Incoming call from <span className="font-mono text-neutral-200">{activeCallPeer}</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleAcceptCall}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-neutral-100 rounded-full px-4 py-3 font-semibold transition-all"
              >
                Accept
              </button>
              <button
                onClick={handleRejectCall}
                className="flex-1 bg-rose-600 hover:bg-rose-500 active:scale-95 text-neutral-100 rounded-full px-4 py-3 font-semibold transition-all"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {(callStatus === 'calling' || callStatus === 'connecting' || callStatus === 'connected') && (
          <>
            <div className="space-y-2">
              {callStatus === 'calling' && (
                <p className="text-sm text-neutral-400">Calling {remotePeerId}...</p>
              )}
              {(callStatus === 'connecting' || callStatus === 'connected') && (
                <p className="text-sm text-neutral-400">
                  Call with <span className="font-mono text-neutral-200">{activeCallPeer}</span>
                </p>
              )}
            </div>

            {callStatus === 'connected' && (
              <>
                <AudioLevelBar audioLevelNode={peerConnection.audioLevelNode} />
                <Timer />
              </>
            )}

            <CallControls
              onHangUp={handleHangUp}
              onMuteToggle={peerConnection.toggleMute}
            />
          </>
        )}

        {callStatus === 'disconnected' && (
          <div className="text-center space-y-4">
            <p className="text-sm text-neutral-400">Call ended</p>
            <button
              onClick={() => {
                setCallStatus('idle');
                setActiveCallPeer(null);
                setRemotePeerId('');
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-neutral-100 rounded-full px-4 py-3 font-semibold transition-all"
            >
              Back to dial pad
            </button>
          </div>
        )}

        {/* Hidden audio element for remote audio */}
        <audio ref={peerConnection.remoteAudioRef} autoPlay playsInline />
      </div>
    </div>
  );
}
