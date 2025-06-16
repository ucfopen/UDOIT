import { useState, useEffect } from 'react';

export default function useInViewPort(ref, options) {
  const [inViewport, setInViewport] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([ entry ]) => {
      setInViewport(entry.isIntersecting)
    }, options)

    const currentRef = ref.current
    if (currentRef) observer.observe(currentRef)

    return () => {
      if (currentRef) observer.unobserve(currentRef)
    }
  }, [ref, options])
  return inViewport
}
