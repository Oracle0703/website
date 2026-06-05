import { NotFoundClient } from "./not-found-client";

// Rendered inside the root layout (header/footer/providers present), so the
// branded 404 keeps the site chrome and offers a path back instead of a
// dead end. Locale-aware copy lives in NotFoundClient via useI18n.
export default function NotFound() {
  return <NotFoundClient />;
}
