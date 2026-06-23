// Postgrest returns PGRST202 when an RPC function isn't found in the
// schema cache, and PGRST205 when a table isn't found — both mean the
// required SQL migration hasn't been run yet, not a real runtime bug.
// We distinguish this from a genuine failure so the UI can show a calm
// "still being set up" message instead of an alarming error.
const SETUP_NOT_COMPLETE_CODES = new Set(['PGRST202', 'PGRST205']);

export function throwIfError(error, fallbackMessage = 'אירעה שגיאה. נסה שוב.') {
  if (!error) return;
  const wrapped = new Error(error.message || fallbackMessage);
  wrapped.code = error.code;
  throw wrapped;
}

export function isSetupNotCompleteError(error) {
  return Boolean(error?.code && SETUP_NOT_COMPLETE_CODES.has(error.code));
}
