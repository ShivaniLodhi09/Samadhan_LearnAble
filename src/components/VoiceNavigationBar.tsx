import React, { useEffect } from 'react';

const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-IN';
  utterance.pitch = 1.1;
  utterance.rate = 0.95;
  speechSynthesis.speak(utterance);
};

const addLongPressListener = (el: HTMLElement, callback: () => void, duration = 600) => {
  let timer: NodeJS.Timeout;
  el.addEventListener('mousedown', () => {
    timer = setTimeout(callback, duration);
  });
  el.addEventListener('mouseup', () => clearTimeout(timer));
  el.addEventListener('mouseleave', () => clearTimeout(timer));
};

const addDoubleTapListener = (el: HTMLElement, callback: () => void) => {
  let lastTap = 0;
  el.addEventListener('touchend', () => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
      callback();
    }
    lastTap = currentTime;
  });
};

export const VoiceNavigationBar: React.FC = () => {
  useEffect(() => {
    const navItems = document.querySelectorAll('.nav-button');

    navItems.forEach((button) => {
      const el = button as HTMLElement;
      const label = el.getAttribute('aria-label') || el.innerText;

      el.addEventListener('mouseenter', () => speak(label));
      el.addEventListener('focus', () => speak(label));

      addLongPressListener(el, () => speak(`Repeating: ${label}`));
      addDoubleTapListener(el, () => speak(`You tapped again: ${label}`));
    });
  }, []);

  return (
    <nav aria-label="Main Navigation" style={{ display: 'flex', gap: '1rem' }}>
      <button className="nav-button" aria-label="Home">🏠 Home</button>
      <button className="nav-button" aria-label="Profile">👤 Profile</button>
      <button className="nav-button" aria-label="Settings">⚙️ Settings</button>
      <button className="nav-button" aria-label="Help">❓ Help</button>
    </nav>
  );
};


