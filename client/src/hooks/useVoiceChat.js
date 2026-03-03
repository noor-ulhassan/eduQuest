import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useVoiceChat — Production-grade WebRTC mesh voice chat.
 *
 * Key reliability features:
 * - ICE candidate queuing (candidates buffered until remote description is set)
 * - No AudioContext (zero interference with WebRTC audio pipeline)
 * - Single-direction offer flow (joiner offers, existing members answer)
 * - Proper cleanup on disconnect
 */
export function useVoiceChat(socket, roomCode, user) {
  const [isInVoice, setIsInVoice] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSpeakers, setActiveSpeakers] = useState(new Set());
  const [voiceUsers, setVoiceUsers] = useState([]);

  const localStreamRef = useRef(null);
  const peersRef = useRef(new Map()); // socketId -> { pc, iceCandidateQueue, remoteDescSet }
  const remoteAudiosRef = useRef(new Map());
  const isInVoiceRef = useRef(false);
  const socketRef = useRef(socket);

  useEffect(() => {
    isInVoiceRef.current = isInVoice;
  }, [isInVoice]);
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  const ICE_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // ── Peer cleanup ───────────────────────────────────────
  const cleanupPeer = useCallback((socketId) => {
    const peer = peersRef.current.get(socketId);
    if (peer?.pc) {
      peer.pc.ontrack = null;
      peer.pc.onicecandidate = null;
      peer.pc.onconnectionstatechange = null;
      peer.pc.close();
    }
    peersRef.current.delete(socketId);

    const audio = remoteAudiosRef.current.get(socketId);
    if (audio) {
      audio.pause();
      audio.srcObject = null;
      audio.remove();
      remoteAudiosRef.current.delete(socketId);
    }
  }, []);

  const cleanupAll = useCallback(() => {
    for (const [sid] of peersRef.current) cleanupPeer(sid);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    setActiveSpeakers(new Set());
  }, [cleanupPeer]);

  // ── Create peer connection with ICE queuing ────────────
  const createPeerConnection = useCallback(
    (targetSocketId) => {
      // Return existing
      if (peersRef.current.has(targetSocketId)) {
        return peersRef.current.get(targetSocketId);
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      const peerData = {
        pc,
        remoteDescSet: false,
        iceCandidateQueue: [], // Buffer ICE candidates until remote desc is set
      };

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Send ICE candidates to remote peer
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("voice:ice-candidate", {
            targetSocketId,
            candidate: event.candidate,
          });
        }
      };

      // Receive remote audio — Audio element ONLY, no AudioContext
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        if (!remoteStream) return;

        let audio = remoteAudiosRef.current.get(targetSocketId);
        if (!audio) {
          audio = new Audio();
          audio.autoplay = true;
          audio.playsInline = true;
          audio.volume = 1.0;
          audio.style.display = "none";
          document.body.appendChild(audio);
          remoteAudiosRef.current.set(targetSocketId, audio);
        }
        audio.srcObject = remoteStream;
        audio.play().catch(() => {});
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        if (state === "failed" || state === "closed") {
          cleanupPeer(targetSocketId);
        }
      };

      peersRef.current.set(targetSocketId, peerData);
      return peerData;
    },
    [cleanupPeer],
  );

  // ── Flush queued ICE candidates ────────────────────────
  const flushIceCandidates = useCallback(async (socketId) => {
    const peer = peersRef.current.get(socketId);
    if (!peer) return;
    for (const candidate of peer.iceCandidateQueue) {
      try {
        await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (_) {}
    }
    peer.iceCandidateQueue = [];
  }, []);

  // ── Initiate a call (create offer) ─────────────────────
  const initiateCall = useCallback(
    async (targetSocketId) => {
      const peer = createPeerConnection(targetSocketId);
      try {
        const offer = await peer.pc.createOffer();
        await peer.pc.setLocalDescription(offer);
        socketRef.current?.emit("voice:offer", {
          targetSocketId,
          offer: peer.pc.localDescription,
        });
      } catch (err) {
        console.error("[Voice] Failed to create offer:", err);
      }
    },
    [createPeerConnection],
  );

  // ── Join voice ─────────────────────────────────────────
  const joinVoice = useCallback(async () => {
    if (!socket || !roomCode || isInVoiceRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      localStreamRef.current = stream;

      socket.emit("voice:join", { roomCode }, (response) => {
        if (response?.success) {
          setVoiceUsers(response.voiceUsers || []);
          setIsInVoice(true);
          isInVoiceRef.current = true;
          setIsMuted(false);

          // Only the joiner sends offers to existing members
          for (const vu of response.voiceUsers) {
            if (vu.socketId !== socket.id) {
              initiateCall(vu.socketId);
            }
          }
        }
      });
    } catch (err) {
      console.error("[Voice] Microphone access denied:", err);
    }
  }, [socket, roomCode, initiateCall]);

  // ── Leave voice ────────────────────────────────────────
  const leaveVoice = useCallback(() => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit("voice:leave", { roomCode });
    }
    cleanupAll();
    setIsInVoice(false);
    isInVoiceRef.current = false;
    setIsMuted(false);
    setVoiceUsers([]);
  }, [roomCode, cleanupAll]);

  // ── Toggle mute ────────────────────────────────────────
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      }
    }
  }, []);

  // ── Socket event listeners ─────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onUserJoined = ({ voiceUsers: updated }) => {
      setVoiceUsers(updated);
    };

    const onUserLeft = ({ socketId, voiceUsers: updated }) => {
      setVoiceUsers(updated);
      cleanupPeer(socketId);
    };

    const onOffer = async ({ fromSocketId, fromUserId, offer }) => {
      if (!isInVoiceRef.current) return;

      const peer = createPeerConnection(fromSocketId);
      try {
        await peer.pc.setRemoteDescription(new RTCSessionDescription(offer));
        peer.remoteDescSet = true;

        // Flush any ICE candidates that arrived before the offer
        await flushIceCandidates(fromSocketId);

        const answer = await peer.pc.createAnswer();
        await peer.pc.setLocalDescription(answer);
        socket.emit("voice:answer", {
          targetSocketId: fromSocketId,
          answer: peer.pc.localDescription,
        });
      } catch (err) {
        console.error("[Voice] Failed to handle offer:", err);
      }
    };

    const onAnswer = async ({ fromSocketId, answer }) => {
      const peer = peersRef.current.get(fromSocketId);
      if (!peer) return;
      try {
        await peer.pc.setRemoteDescription(new RTCSessionDescription(answer));
        peer.remoteDescSet = true;

        // Flush any ICE candidates that arrived before the answer
        await flushIceCandidates(fromSocketId);
      } catch (err) {
        console.error("[Voice] Failed to handle answer:", err);
      }
    };

    const onIceCandidate = async ({ fromSocketId, candidate }) => {
      const peer = peersRef.current.get(fromSocketId);
      if (!peer) return;

      // If remote description isn't set yet, queue the candidate
      if (!peer.remoteDescSet) {
        peer.iceCandidateQueue.push(candidate);
        return;
      }

      try {
        await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (_) {}
    };

    // Remote speaking state
    const onSpeaking = ({ userId, speaking }) => {
      setActiveSpeakers((prev) => {
        const has = prev.has(userId);
        if (speaking === has) return prev;
        const next = new Set(prev);
        speaking ? next.add(userId) : next.delete(userId);
        return next;
      });
    };

    socket.on("voice:user-joined", onUserJoined);
    socket.on("voice:user-left", onUserLeft);
    socket.on("voice:offer", onOffer);
    socket.on("voice:answer", onAnswer);
    socket.on("voice:ice-candidate", onIceCandidate);
    socket.on("voice:speaking", onSpeaking);

    return () => {
      socket.off("voice:user-joined", onUserJoined);
      socket.off("voice:user-left", onUserLeft);
      socket.off("voice:offer", onOffer);
      socket.off("voice:answer", onAnswer);
      socket.off("voice:ice-candidate", onIceCandidate);
      socket.off("voice:speaking", onSpeaking);
    };
  }, [socket, createPeerConnection, cleanupPeer, flushIceCandidates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInVoiceRef.current) {
        cleanupAll();
        if (socketRef.current && roomCode) {
          socketRef.current.emit("voice:leave", { roomCode });
        }
      }
    };
  }, []);

  return {
    isInVoice,
    isMuted,
    activeSpeakers,
    voiceUsers,
    joinVoice,
    leaveVoice,
    toggleMute,
  };
}
