export function PreferenceBootScript() {
  const script = `
(function () {
  function readCookie(name) {
    var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : "";
  }

  try {
    var storedTheme = localStorage.getItem("theme") || readCookie("theme");

    if (storedTheme === "dark" || storedTheme === "light") {
      document.documentElement.dataset.theme = storedTheme;
    }
  } catch (error) {
    return;
  }
})();
  `.trim();

  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
