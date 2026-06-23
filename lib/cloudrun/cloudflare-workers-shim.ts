export const env = new Proxy<Record<string, string | undefined>>(
  {},
  {
    get(_target, property) {
      return typeof property === "string" ? process.env[property] : undefined;
    },
  }
);
