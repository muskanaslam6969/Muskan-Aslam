export function notFound(_req, res) { res.status(404).json({ message: 'Route not found.' }); }
export function errorHandler(err, _req, res, _next) {
  console.error(err);
  if (err?.name === 'ZodError') return res.status(400).json({ message: 'Validation failed.', errors: err.issues });
  res.status(500).json({ message: 'An unexpected server error occurred.' });
}