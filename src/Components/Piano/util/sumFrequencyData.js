function sumFrequencyData(float32Array) {
  let total = 0.0;
  const len = float32Array.length;
  for(let i=0;i<len;i++) {
    const cleanValue = Math.abs(float32Array[i]);
    // const cleanValue = float32Array[i];
    if(typeof cleanValue === 'number' && isFinite(cleanValue)) {
      total += parseFloat(cleanValue);
    }
  }
  return total;
}
export default sumFrequencyData;