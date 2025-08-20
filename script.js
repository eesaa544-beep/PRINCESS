document.addEventListener('DOMContentLoaded', () => {
  const pinInputs = document.querySelectorAll('.pin-inputs input');
  const pinScreen = document.getElementById('pin-screen');
  const introScreen = document.getElementById('intro-screen');
  const mainScreen = document.getElementById('main-screen');
  const correctPin = "130206";

  pinInputs.forEach((input, idx) => {
    input.addEventListener('input', () => {
      if (input.value && idx < pinInputs.length - 1) {
        pinInputs[idx+1].focus();
      }
      if ([...pinInputs].every(i => i.value)) {
        const entered = [...pinInputs].map(i => i.value).join('');
        if (entered === correctPin) {
          pinScreen.classList.remove('active');
          introScreen.classList.add('active');
          const video = document.getElementById('intro-video');
          video.onended = () => {
            introScreen.classList.remove('active');
            mainScreen.classList.add('active');
          };
        } else {
          alert("Incorrect PIN");
          pinInputs.forEach(i => i.value = "");
          pinInputs[0].focus();
        }
      }
    });
  });
});
