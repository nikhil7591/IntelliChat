import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

const useVideoCallStore = create(
  subscribeWithSelector((set, get) => ({
    // call state
    currentCall: null,
    incomingCall: null,
    isCallActive: false,
    callType: null, //video or audio

    // media state
    localStream: null,
    remoteStream: null,
    isVideoEnabled: true,
    isAudioEnabled: true,

    // webRTC
    peerConnection: null,
    iceCandidatesQueue: [],
    isCallModalOpen: false,
    callStatus: "idle", // idle,calling,ringing, connecting, connected, ended

    // Actions
    setCurrentCall: (call) => {
      set({ currentCall: call });
    },
    setIncomingCall: (call) => {
      set({ incomingCall: call });
    },
    setCallActive: (active) => {
      set({ isCallActive: active });
    },
    setCallType: (type) => {
      set({ callType: type });
    },
    setLocalStream: (stream) => {
      set({ localStream: stream });
    },
    setRemoteStream: (stream) => {
      set({ remoteStream: stream });
    },
    setPeerConnection: (pc) => {
      set({ peerConnection: pc });
    },
    setCallModalOpen: (open) => {
      set({ isCallModalOpen: open });
    },
    setCallStatus: (status) => {
      set({ callStatus: status });
    },
    addIceCandidate: (candidate) => {
      const { iceCandidatesQueue } = get();
      set({ iceCandidatesQueue: [...iceCandidatesQueue, candidate] });
    },
    processQueuedIceCandidates: async () => {
      const { peerConnection, iceCandidatesQueue } = get();
      if (
        peerConnection &&
        peerConnection.remoteDescription &&
        iceCandidatesQueue.length > 0
      ) {
        for (const candidate of iceCandidatesQueue) {
          try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (error) {
            console.error("ICE candidate error", error);
          }
        }
        set({ iceCandidatesQueue: [] });
      }
    },

    toggleVideo: () => {
      const { localStream, isVideoEnabled } = get();
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !isVideoEnabled;
          set({ isVideoEnabled: !isVideoEnabled });
        }
      }
    },
    toggleAudio: () => {
      const { localStream, isAudioEnabled } = get();
      if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !isAudioEnabled;
          set({ isAudioEnabled: !isAudioEnabled });
        }
      }
    },

    endCall: () => {
      const { localStream, peerConnection } = get();

      // Stop media streams
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      // Close peer connection
      if (peerConnection) {
        peerConnection.close();
      }
      // Reset all state
      set({
        currentCall: null,
        incomingCall: null,
        isCallActive: false,
        callType: null,
        localStream: null,
        remoteStream: null,
        isVideoEnabled: true,
        isAudioEnabled: true,
        peerConnection: null,
        iceCandidatesQueue: [],
        isCallModalOpen: false,
        callStatus: "idle",
      });
    },

    clearIncomingCall: () => {
      set({ incomingCall: null });
    },
  }))
);

export default useVideoCallStore;
