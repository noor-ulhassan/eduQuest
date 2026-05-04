const listeners = new Set();

export const onEvent = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const emit = (event) => {
  listeners.forEach((cb) => cb(event));
};
