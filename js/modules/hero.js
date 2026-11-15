// Remaining per-axis distance, in CSS pixels, below which the interpolation snaps to its target and
// stops requesting frames. The step is far below one device pixel, so the snap is not visible.
const SETTLE_THRESHOLD = 0.05;

export const initHero = () => {
  const heroImage = document.querySelector("[data-hero-image]");
  if (!heroImage) return;

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  let animationFrameId = null;
  let motionActive = false;

  const img = heroImage.querySelector("img");
  if (!img) return;
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  // With motion allowed the script is the only owner of the image transform, including its resting
  // scale; with reduced motion the inline transform is cleared and `css/sections/hero.css` owns it.
  const renderTransform = () => {
    img.style.transform = `scale(1.03) translate(${mouseX}px, ${mouseY}px)`;
  };

  const animate = () => {
    animationFrameId = null;

    mouseX += (targetX - mouseX) * 0.1;
    mouseY += (targetY - mouseY) * 0.1;

    const settled =
      Math.abs(targetX - mouseX) < SETTLE_THRESHOLD && Math.abs(targetY - mouseY) < SETTLE_THRESHOLD;

    if (settled) {
      mouseX = targetX;
      mouseY = targetY;
    }

    renderTransform();

    if (!settled) {
      animationFrameId = requestAnimationFrame(animate);
    }
  };

  // Frames are requested only while the image has not reached its target, and never more than one
  // at a time.
  const requestMotionFrame = () => {
    if (animationFrameId !== null) return;
    if (mouseX === targetX && mouseY === targetY) return;

    animationFrameId = requestAnimationFrame(animate);
  };

  const handleMouseMove = (e) => {
    const rect = heroImage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    targetX = (x - centerX) * 0.03;
    targetY = (y - centerY) * 0.03;
    requestMotionFrame();
  };

  const handleMouseLeave = () => {
    targetX = 0;
    targetY = 0;
    requestMotionFrame();
  };

  const startMotion = () => {
    if (motionActive) return;

    motionActive = true;
    heroImage.addEventListener("mousemove", handleMouseMove);
    heroImage.addEventListener("mouseleave", handleMouseLeave);
    renderTransform();
  };

  const stopMotion = () => {
    if (!motionActive) return;

    motionActive = false;
    heroImage.removeEventListener("mousemove", handleMouseMove);
    heroImage.removeEventListener("mouseleave", handleMouseLeave);

    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    mouseX = 0;
    mouseY = 0;
    targetX = 0;
    targetY = 0;
    img.style.transform = "";
  };

  const syncMotionPreference = (event) => {
    if (event.matches) {
      stopMotion();
    } else {
      startMotion();
    }
  };

  reducedMotionQuery.addEventListener("change", syncMotionPreference);

  if (!reducedMotionQuery.matches) {
    startMotion();
  }
};
