function debounce<F extends (...args: any[]) => void>(fn: F, delay: number) {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<F>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}