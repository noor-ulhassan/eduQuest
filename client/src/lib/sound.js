const play = (src, volume = 0.6) => {
  try {
    const audio = new Audio(src);
    audio.volume = Math.min(1, Math.max(0, volume));
    audio.play().catch(() => {});
  } catch (_) {}
};

export const playNotificationSound = () => play("/ui2.mp3");
export const playPlayerJoinedSound = () => play("/ui2.mp3");
export const playVSScreenSound = () => play("/ui2.mp3", 0.8);
export const playStartGameSound = () => play("/ui2.mp3", 0.9);
export const playVictorySound = () => play("/ui2.mp3", 0.9);
export const playWrongSound = () => play("/ui2.mp3", 0.4);
export const playCorrectSound = () => play("/ui2.mp3", 0.6);
