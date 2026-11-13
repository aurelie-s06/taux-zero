/**
 * Liens d'accès rapide : premiers éléments atteints au clavier, visibles au focus.
 */
export function SkipLinks({ navigation = true }: { navigation?: boolean }) {
  return (
    <ul className="b-skip">
      <li>
        <a href="#contenu">Aller au contenu</a>
      </li>
      {navigation && (
        <li>
          <a href="#navigation">Aller au menu</a>
        </li>
      )}
    </ul>
  );
}
