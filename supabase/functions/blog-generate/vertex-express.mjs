export function vertexExpressUrl(model = 'gemini-3.8-flash') {
  if (!/^gemini-[a-z0-9.-]+$/.test(model || '')) throw new Error('GEMINI_MODEL tidak valid.');
  return `https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:generateContent`;
}
