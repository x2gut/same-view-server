export type VoiceChatUser = {
  id: string;
  username: string;
  settings: VoiceSettings;
};

export type VoiceSettings = {
  isMuted: boolean;
  isDeaf: boolean;
};
