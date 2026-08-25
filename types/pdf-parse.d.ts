declare module "pdf-parse/lib/pdf-parse.js" {
  export interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    version: string;
    text: string;
  }
  function pdf(dataBuffer: Buffer): Promise<PDFParseResult>;
  export default pdf;
}
