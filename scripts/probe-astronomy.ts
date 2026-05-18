import * as AstronomyModule from 'astronomy-engine';

console.log("\n🔭 Astronomy Engine Runtime Export Probe");
console.log("=========================================");

console.log(`Type of AstronomyModule: ${typeof AstronomyModule}`);
console.log(`Keys of AstronomyModule: ${Object.keys(AstronomyModule).slice(0, 10).join(', ')}...`);

const isDefaultWrapped = 'default' in AstronomyModule;
console.log(`Contains 'default' property: ${isDefaultWrapped}`);

if (isDefaultWrapped) {
  const defaultExport = (AstronomyModule as any).default;
  console.log(`Type of default export: ${typeof defaultExport}`);
  console.log(`Keys of default export: ${Object.keys(defaultExport).slice(0, 10).join(', ')}...`);
  
  if (defaultExport && typeof defaultExport.Observer === 'function') {
    console.log("✅ Observer constructor successfully located inside 'default' export!");
  } else {
    console.log("❌ Observer constructor not found in 'default' export.");
  }
} else {
  if (typeof (AstronomyModule as any).Observer === 'function') {
    console.log("✅ Observer constructor successfully located inside direct namespace export!");
  } else {
    console.log("❌ Observer constructor not found in direct namespace export.");
  }
}
console.log("=========================================\n");
