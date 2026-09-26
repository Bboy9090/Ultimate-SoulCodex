// Compatibility surface for the governed transit engine.
// Keep one implementation so natal validation, aspect math, and fail-closed
// behavior cannot drift between package and server consumers.
export * from '../../transits';
