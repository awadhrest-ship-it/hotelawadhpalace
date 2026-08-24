import { useEffect, useRef } from 'react';

/**
 * Initializes the original template's Owl Carousel plugin on the given ref
 * and destroys it cleanly on unmount / dependency change, so navigating
 * between routes never leaves duplicate instances or stale event handlers.
 */
export function useOwlCarousel(options, deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    const $ = window.jQuery;
    if (!$ || !ref.current) return undefined;
    const $el = $(ref.current);
    $el.owlCarousel(options);
    return () => {
      if ($el.data('owl.carousel')) {
        $el.trigger('destroy.owl.carousel');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
