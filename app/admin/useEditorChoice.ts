import { useRouteLoaderData } from "react-router";

/**
 * The admin's default rich-text editor, provided by the admin layout loader
 * ([app/routes/admin/layout.tsx]). Used for brand-new documents; existing docs
 * carry their own `bodyFormat`.
 */
export function useEditorChoice(): "blocknote" | "lexical" {
  const data = useRouteLoaderData("routes/admin/layout") as
    | { editorChoice?: "blocknote" | "lexical" }
    | undefined;
  return data?.editorChoice ?? "blocknote";
}
