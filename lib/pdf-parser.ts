export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfParseModule = await import('pdf-parse')
  const pdfParse = (pdfParseModule as unknown as { default: (buf: Buffer) => Promise<{ text: string }> }).default ?? pdfParseModule
  const data = await (pdfParse as (buf: Buffer) => Promise<{ text: string }>)(buffer)
  return data.text
}

export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  return `[画像ファイルが添付されました。Claude Vision APIによる解析を行います。サイズ: ${buffer.length} bytes]`
}
