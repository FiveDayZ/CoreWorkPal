type FeedbackType = "alert" | "click" | "meow";

export function playAudioFeedback(type: FeedbackType, enabled: boolean) {
  if (!enabled || typeof window === "undefined") {
    return;
  }

  const audioWindow = window as Window & {
    webkitAudioContext?: typeof AudioContext;
  };
  const AudioContextCtor = window.AudioContext ?? audioWindow.webkitAudioContext;

  if (!AudioContextCtor) {
    return;
  }

  const context = new AudioContextCtor();
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.connect(gain);
  gain.connect(context.destination);
  gain.gain.setValueAtTime(0.045, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  if (type === "alert") {
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(240, now);
    oscillator.frequency.exponentialRampToValueAtTime(520, now + 0.12);
  } else if (type === "meow") {
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(620, now);
    oscillator.frequency.exponentialRampToValueAtTime(420, now + 0.16);
  } else {
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(500, now);
    oscillator.frequency.exponentialRampToValueAtTime(1000, now + 0.08);
  }

  oscillator.start(now);
  oscillator.stop(now + (type === "meow" ? 0.16 : 0.12));
}
