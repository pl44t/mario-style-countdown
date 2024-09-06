for(const text of document.querySelectorAll(".modal-action-text")) {
  const letters = text.textContent.split("");
  
  text.innerHTML = "";  
  
  letters.forEach((letter, index) => {
    const span = document.createElement("span");
    
    span.className = "modal-action-text-letter";
    
    span.style.animationDelay = `${index * 300}ms`;
    span.style.animationDuration = `${(letters.length * 300) + 1000}ms`;
    
    span.innerHTML = letter;
    
    text.appendChild(span);
  });
}

/* --- Magic mouse effect --- */

let start = new Date().getTime();

const originPosition = { x: 0, y: 0 };

const container = document.getElementById("magic-mouse-container"),
      cursor = document.getElementById("cursor");

const last = {
  starTimestamp: start,
  starPosition: originPosition,
  mousePosition: originPosition
}

const config = {
  starAnimationDuration: 1500,
  minimumTimeBetweenStars: 250,
  minimumDistanceBetweenStars: 75,
  glowDuration: 75,
  maximumGlowPointSpacing: 10,
  colors: ["245 245 245", "59 130 246"],
  sizes: ["1.4rem", "1rem", "0.6rem"],
  animations: ["fall-1", "fall-2", "fall-3"]
}

let count = 0;
  
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
      selectRandom = items => items[rand(0, items.length - 1)];

const withUnit = (value, unit) => `${value}${unit}`,
      px = value => withUnit(value, "px"),
      ms = value => withUnit(value, "ms");

const calcDistance = (a, b) => {
  const diffX = b.x - a.x,
        diffY = b.y - a.y;
  
  return Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
}

const calcElapsedTime = (start, end) => end - start;

const appendElement = element => container.appendChild(element),
      removeElement = (element, delay) => setTimeout(() => container.removeChild(element), delay);

const createStar = position => {
  const star = document.createElement("span"),
        color = selectRandom(config.colors);
  
  star.className = "item fa-solid fa-block-question";
  
  star.style.left = px(position.x);
  star.style.top = px(position.y);
  star.style.fontSize = selectRandom(config.sizes);
  star.style.color = `rgb(${color})`;
  star.style.textShadow = `0px 0px 1.5rem rgb(${color} / 0.5)`;
  star.style.animationName = config.animations[count++ % 3];
  star.style.starAnimationDuration = ms(config.starAnimationDuration);
  
  appendElement(star);

  removeElement(star, config.starAnimationDuration);
}

const createGlowPoint = position => {
  const glow = document.createElement("div");
  
  glow.className = "glow-point";
  
  glow.style.left = px(position.x);
  glow.style.top = px(position.y);
  
  appendElement(glow)
  
  removeElement(glow, config.glowDuration);
}

const determinePointQuantity = distance => Math.max(
  Math.floor(distance / config.maximumGlowPointSpacing),
  1
);

const createGlow = (last, current) => {
  const distance = calcDistance(last, current),
        quantity = determinePointQuantity(distance);
  
  const dx = (current.x - last.x) / quantity,
        dy = (current.y - last.y) / quantity;
  
  Array.from(Array(quantity)).forEach((_, index) => { 
    const x = last.x + dx * index, 
          y = last.y + dy * index;
    
    createGlowPoint({ x, y });
  });
}

const updateLastStar = position => {
  last.starTimestamp = new Date().getTime();

  last.starPosition = position;
}

const updateLastMousePosition = position => last.mousePosition = position;

const adjustLastMousePosition = position => {
  if(last.mousePosition.x === 0 && last.mousePosition.y === 0) {
    last.mousePosition = position;
  }
};

const moveCursor = e => {  
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
}

const handleOnMove = e => {
  const mousePosition = { x: e.clientX, y: e.clientY }
  
  moveCursor(e);
  
  adjustLastMousePosition(mousePosition);
  
  const now = new Date().getTime(),
        hasMovedFarEnough = calcDistance(last.starPosition, mousePosition) >= config.minimumDistanceBetweenStars,
        hasBeenLongEnough = calcElapsedTime(last.starTimestamp, now) > config.minimumTimeBetweenStars;
  
  if(hasMovedFarEnough || hasBeenLongEnough) {
    createStar(mousePosition);
    
    updateLastStar(mousePosition);
  }
  
  createGlow(last.mousePosition, mousePosition);
  
  updateLastMousePosition(mousePosition);
}

window.onmousemove = e => handleOnMove(e);

window.ontouchmove = e => handleOnMove(e.touches[0]);

document.body.onmouseleave = () => updateLastMousePosition(originPosition);

document.addEventListener("DOMContentLoaded", function() {
  const countdownElement = document.getElementById("countdown");
  const progressBar = document.getElementById("progress-fill");

  function updateCountdown() {
    const now = new Date();
    const targetDate = new Date("October 22, 2024 15:35:00");
    const startDate = new Date("September 1, 2024 00:00:00");
    const timeRemaining = targetDate - now;
    const totalDuration = targetDate - startDate;

    if (timeRemaining > 0) {
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      // Calculate percentage progress
      const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;
      progressBar.style.width = `${progress}%`;

    } else {
      countdownElement.textContent = "The countdown is over!";
      progressBar.style.width = "100%";
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);  // Update every second
});
