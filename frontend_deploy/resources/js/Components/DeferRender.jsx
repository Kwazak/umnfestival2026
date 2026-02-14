import React, { useEffect, useRef, useState } from 'react';

// Defer rendering children until the container is near the viewport.
// Useful to delay heavy sections without route-level code-splitting.
export default function DeferRender({ rootMargin = '200px', children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    if (!('IntersectionObserver' in window)) {
      // Fallback: render immediately
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      });
    }, { root: null, rootMargin, threshold: 0.01 });

    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [rootMargin, visible]);

  return (
    <div ref={ref}>
      {visible ? children : null}
    </div>
  );
}
