// Try to load from the company-seals directory
const sealName = imagePath.split('/').pop();
try {
  // Dynamic import for the company seal
  // @ts-ignore
  const sealModule = await import(/* @vite-ignore */ `../assets/company-seals/${sealName}`);
  assetPath = sealModule.default;
} catch (error) {
  console.warn(`Company seal ${sealName} not found, using default seal`);
  // Use import.meta.url to get the relative path
  const defaultSeal = await import(/* @vite-ignore */ '../assets/company-seal.jpg');
  assetPath = defaultSeal.default;
} 