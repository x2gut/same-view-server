export type SignalDataType =
  | {
      sdp: RTCSessionDescriptionInit;
    }
  | { candidate: RTCIceCandidate };

export type SignalPayload = {
  target: string;
  data: SignalDataType;
  type: 'offer' | 'answer' | 'candidate';
};
