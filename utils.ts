export const getCurrentTimestampSeconds = () => {
  return +(Date.now() / 1000).toFixed(0);
}