export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: "try { document.documentElement.dataset.theme = localStorage.getItem('koluchka-theme') || 'light'; } catch {}" }} />;
}
