const play = (src, volume = 0.6) => {
  try {
    const audio = new Audio(src);
    audio.volume = Math.min(1, Math.max(0, volume));
    audio.play().catch(() => {});
  } catch (_) {}
};

export const playNotificationSound = () => play("/ui2.mp3");
export const playPlayerJoinedSound = () => play("/ui2.mp3");
