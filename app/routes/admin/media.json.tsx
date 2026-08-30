import type { Route } from "./+types/media.json";
import { requireUser } from "~/lib/auth.server";
import { listMedia } from "~/lib/media.server";

/** JSON feed of the media library, used by the in-form MediaPicker. */
export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request);
  return { media: await listMedia() };
}
