declare module 'react-native-print' {
  interface PrintOptions {
    html?: string;
    filePath?: string;
    printerURL?: string;
    isLandscape?: boolean;
    jobName?: string;
  }

  interface RNPrintStatic {
    print(options: PrintOptions): Promise<void>;
    selectPrinter(options?: { x?: number; y?: number }): Promise<{ url: string; name: string }>;
  }

  const RNPrint: RNPrintStatic;
  export default RNPrint;
}
