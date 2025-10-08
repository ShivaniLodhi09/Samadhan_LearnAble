// Voice agent function
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-IN'; // Adjust for locale
  utterance.pitch = 1.1;
  utterance.rate = 0.95;
  speechSynthesis.speak(utterance);
}

// Long press detection
function addLongPressListener(el, callback, duration = 600) {
  let timer;
  el.addEventListener('mousedown', () => {
    timer = setTimeout(() => callback(), duration);
  });
  el.addEventListener('mouseup', () => clearTimeout(timer));
  el.addEventListener('mouseleave', () => clearTimeout(timer));
}

// Double tap detection (touch devices)
function addDoubleTapListener(el, callback) {
  let lastTap = 0;
  el.addEventListener('touchend', () => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
      callback();
    }
    lastTap = currentTime;
  });
}

// Main initializer
function initVoiceNavigation() {
  const navItems = document.querySelectorAll('.nav-button');

  navItems.forEach(button => {
    const label = button.getAttribute('aria-label') || button.innerText;

    // Cursor focus triggers voice
    button.addEventListener('mouseenter', () => speak(label));
    button.addEventListener('focus', () => speak(label));

    // Long press to repeat
    addLongPressListener(button, () => speak(`Repeating: ${label}`));

    // Double tap to repeat
    addDoubleTapListener(button, () => speak(`You tapped again: ${label}`));
  });
}
