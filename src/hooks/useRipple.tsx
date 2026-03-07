import { useCallback, MouseEvent } from "react";

export const useRipple = () => {
  const createRipple = useCallback((event: MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className = "ripple-effect";

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }, []);

  return { createRipple };
};
