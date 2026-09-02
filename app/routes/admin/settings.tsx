import { Form, useNavigation } from "react-router";
import type { Route } from "./+types/settings";
import { getSettingsValues, saveSettings } from "~/lib/settings.server";
import { saveOrError } from "~/lib/admin.server";
import {
  PageHeader,
  TextField,
  TextareaField,
  SelectField,
  FormActions,
} from "~/admin/form";

export function meta() {
  return [{ title: "Settings — Admin" }];
}

export async function loader() {
  return { values: await getSettingsValues() };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const err = await saveOrError(() => saveSettings(form));
  return err ?? { ok: true };
}

export default function Settings({ loaderData, actionData }: Route.ComponentProps) {
  const v = loaderData.values;
  const nav = useNavigation();
  const fe = (actionData && "fieldErrors" in actionData && actionData.fieldErrors) || {};
  return (
    <div>
      <PageHeader title="Settings" />
      {actionData && "ok" in actionData && (
        <p className="mb-4 text-sm text-green-600">Saved.</p>
      )}
      <Form method="post" className="max-w-xl space-y-5">
        <TextField name="siteName" label="Site name" defaultValue={v.siteName} required error={fe.siteName} />
        <TextField name="siteUrl" label="Site URL" defaultValue={v.siteUrl} required error={fe.siteUrl} hint="Canonical production URL" />
        <TextField name="tagline" label="Tagline" defaultValue={v.tagline} hint="Short brand line, e.g. shown in the PWA manifest" />
        <TextField name="defaultSeoTitle" label="Default SEO title" defaultValue={v.defaultSeoTitle} />
        <TextareaField name="defaultSeoDescription" label="Default SEO description" defaultValue={v.defaultSeoDescription} />
        <TextField name="contactEmail" label="Contact email" defaultValue={v.contactEmail} error={fe.contactEmail} />
        <TextField name="contactPhone" label="Contact phone" defaultValue={v.contactPhone} />
        <TextareaField name="address" label="Address" defaultValue={v.address} hint="Postal address. Shown on the footer and contact page." />
        <TextareaField name="clients" label="Clients" defaultValue={v.clients} hint="Regions / clients line, shown below the address." />
        <fieldset className="space-y-4 rounded-md border border-gray-200 p-4 dark:border-gray-800">
          <legend className="px-1 text-sm font-medium">Editing</legend>
          <SelectField
            name="editor"
            label="Rich-text editor"
            options={[
              { value: "blocknote", label: "BlockNote" },
              { value: "lexical", label: "Lexical" },
            ]}
            defaultValue={v.editor ?? "blocknote"}
          />
          <p className="text-xs text-gray-500">
            Editor used for new pages, posts and case studies. Existing content
            keeps whichever editor it was created with.
          </p>
        </fieldset>
        <fieldset className="space-y-4 rounded-md border border-gray-200 p-4 dark:border-gray-800">
          <legend className="px-1 text-sm font-medium">Social</legend>
          <TextField name="twitter" label="Twitter / X URL" defaultValue={v.twitter} />
          <TextField name="linkedin" label="LinkedIn URL" defaultValue={v.linkedin} />
          <TextField name="github" label="GitHub URL" defaultValue={v.github} />
        </fieldset>
        <FormActions busy={nav.state !== "idle"} backTo="/admin" submitLabel="Save settings" />
      </Form>
    </div>
  );
}
