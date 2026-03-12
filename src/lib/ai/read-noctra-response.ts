export async function readNoctraResponse(
  response: Response,
  onChunk?: (chunk: string) => void,
) {
  const reader = response.body?.getReader();
  if (!reader) return "";

  const decoder = new TextDecoder();
  let protocolBuffer = "";
  let plainTextBuffer = "";
  let result = "";
  let sawProtocolFrames = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    plainTextBuffer += chunk;
    protocolBuffer += chunk;

    const lines = protocolBuffer.split("\n");
    protocolBuffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith('0:"')) continue;

      const match = line.match(/^0:"(.*)"\s*$/);
      if (!match) continue;

      sawProtocolFrames = true;
      const text = match[1]
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");

      result += text;
      onChunk?.(result);
    }
  }

  if (sawProtocolFrames) {
    return result;
  }

  const finalText = plainTextBuffer.trim();
  if (finalText) {
    onChunk?.(finalText);
  }
  return finalText;
}

