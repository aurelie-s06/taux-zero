/**
 * Message d'erreur d'un champ. `propsChamp` le relie au champ :
 * il est lu par les lecteurs d'écran quand le champ prend le focus.
 */
export function ErreurChamp({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="field__error" role="alert">
      {message}
    </p>
  );
}

export function propsChamp(idErreur: string, message?: string) {
  return message ? { "aria-invalid": true, "aria-describedby": idErreur } : {};
}
