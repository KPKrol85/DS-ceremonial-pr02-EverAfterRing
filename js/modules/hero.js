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

  const handleMouseMove = (e) => {
    const rect = heroImage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    targetX = (x - centerX) * 0.03;
    targetY = (y - centerY) * 0.03;
  };

  const handleMouseLeave = () => {
    targetX = 0;
    targetY = 0;
  };

  const animate = () => {
    if (!motionActive) return;

    mouseX += (targetX - mouseX) * 0.1;
    mouseY += (targetY - mouseY) * 0.1;

    img.style.transform = `scale(1.03) translate(${mouseX}px, ${mouseY}px)`;

    animationFrameId = requestAnimationFrame(animate);
  };

  const startMotion = () => {
    if (motionActive) return;

    motionActive = true;
    heroImage.addEventListener("mousemove", handleMouseMove);
    heroImage.addEventListener("mouseleave", handleMouseLeave);
    animationFrameId = requestAnimationFrame(animate);
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
