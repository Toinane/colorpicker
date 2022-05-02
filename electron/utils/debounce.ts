export default function debounce<T extends unknown[], U>(
  callback: (...args: T) => PromiseLike<U> | U,
  wait = 300,
) {
  let timer: NodeJS.Timeout;

  return (...args: T): Promise<U> => {
    clearTimeout(timer);
    return new Promise((resolve) => {
      timer = setTimeout(() => resolve(callback(...args)), wait);
    });
  };
}
