import { Form, useNavigation } from "react-router";
import type { Route } from "./+types/company-history";
import {
  getCompanyHistoryValues,
  saveCompanyHistory,
} from "~/lib/company-history.server";
import { saveOrError } from "~/lib/admin.server";
import {
  PageHeader,
  Field,
  TextField,
  TextareaField,
  FormActions,
} from "~/admin/form";
import { Textarea } from "~/components/ui/textarea";

export function meta() {
  return [{ title: "Company History — Admin" }];
}

export async function loader() {
  return { values: await getCompanyHistoryValues() };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const err = await saveOrError(() => saveCompanyHistory(form));
  return err ?? { ok: true };
}

export default function CompanyHistoryAdmin({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const v = loaderData.values;
  const nav = useNavigation();
  const fe =
    (actionData && "fieldErrors" in actionData && actionData.fieldErrors) || {};
  return (
    <div>
      <PageHeader title="Company History" />
      {actionData && "ok" in actionData && (
        <p className="mb-4 text-sm text-green-600">Saved.</p>
      )}
      {actionData && "formError" in actionData && actionData.formError && (
        <p className="mb-4 text-sm text-red-600">{actionData.formError}</p>
      )}
      <Form method="post" className="max-w-2xl space-y-5">
        <TextareaField
          name="intro"
          label="Intro"
          defaultValue={v.intro}
          error={fe.intro}
          hint="Short lead paragraph shown at the top of the /history page."
        />
        <Field
          label="Office addresses (JSON)"
          error={fe.addressesJson}
          hint={
            'Array of { label, lines, city, country, type, status, fromYear, toYear, note, order, hidden }. ' +
            'type: main-office | branch | registered-office. ' +
            'status: open-current | temporarily-closed | permanently-closed. ' +
            'Leave toYear blank for the current office. Set hidden:true to keep a row without showing it.'
          }
        >
          <Textarea
            name="addressesJson"
            defaultValue={v.addressesJson}
            className="min-h-64 font-mono text-xs"
          />
        </Field>
        <Field
          label="Logos (JSON)"
          error={fe.logosJson}
          hint={
            'Array of { image, label, fromYear, toYear, note, order, hidden }. ' +
            'image = Media id — copy it from the Media library (/admin/media). ' +
            'Leave toYear blank for the current logo.'
          }
        >
          <Textarea
            name="logosJson"
            defaultValue={v.logosJson}
            className="min-h-64 font-mono text-xs"
          />
        </Field>
        <fieldset className="space-y-4 rounded-md border border-gray-200 p-4 dark:border-gray-800">
          <legend className="px-1 text-sm font-medium">SEO</legend>
          <TextField
            name="seoTitle"
            label="Meta title"
            defaultValue={v.seoTitle}
          />
          <TextareaField
            name="seoDescription"
            label="Meta description"
            defaultValue={v.seoDescription}
          />
        </fieldset>
        <FormActions
          busy={nav.state !== "idle"}
          backTo="/admin"
          submitLabel="Save company history"
        />
      </Form>
    </div>
  );
}
