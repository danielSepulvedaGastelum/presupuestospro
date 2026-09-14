declare module 'pdfmake/build/pdfmake' {
  import type { TDocumentDefinitions } from 'pdfmake/interfaces'
  interface OutputDocument { download(filename?: string): Promise<void> }
  interface PdfMakeBrowser {
    addVirtualFileSystem(vfs: Record<string, string>): void
    createPdf(definition: TDocumentDefinitions): OutputDocument
  }
  const pdfMake: PdfMakeBrowser
  export default pdfMake
}

declare module 'pdfmake/build/vfs_fonts' {
  const vfs: Record<string, string>
  export default vfs
}

