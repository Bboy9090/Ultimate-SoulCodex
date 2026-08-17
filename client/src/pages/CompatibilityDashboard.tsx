// Legacy Compatibility entrypoint retained only for import compatibility.
// The canonical consumer experience lives in CompatibilityHubPage and its
// Explorer/Person routes. Keeping a second scoring UI here would reintroduce
// the retired overall-score contract and stale profile storage paths.
export { default } from "./CompatibilityHubPage";
