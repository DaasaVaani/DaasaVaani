interface WebConfig {
  formatVersion: 1; base: string; descriptorUrl: string; demoPort: number;
  defaultUiLanguage: "en" | "kn"; defaultTheme: "light" | "dark";
  databaseName: string; maxFavorites: number; fontFamily: string;
  readerFontSize: number; space: number; contentWidth: number; readerWidth: number;
  uiLanguages: ("en" | "kn")[];
  uiThemes: ("light" | "dark")[];
  demoViewports: { desktop: { width: number; height: number }; mobile: { width: number; height: number } };
  themes: Record<"light" | "dark", Record<string, string>>;
}
declare const __WEB_CONFIG__: WebConfig;
declare const __BOUNDS__: {
  maxDescriptorBytes: number; maxManifestEncodedBytes: number; maxManifestDecodedBytes: number;
  maxItemEncodedBytes: number; maxItemDecodedBytes: number; maxPolicyEncodedBytes: number;
  maxPolicyDecodedBytes: number; maxIndexEncodedBytes: number; maxIndexDecodedBytes: number;
  metadataTimeoutMs: number; supportedRequiredCapabilities: string[];
};
