import { Form, useNavigation } from "react-router";
import type { FormErrors } from "~/lib/admin.server";
import type { PageValues } from "~/lib/pages.server";
import {
  Field,
  FormActions,
  SelectField,
  TextField,
  TextareaField,
} from "~/admin/form";
import { RichTextEditor } from "~/admin/RichTextEditor";
import { MediaField } from "~/admin/MediaField";
import { useEditorChoice } from "~/admin/useEditorChoice";

const STATUS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const TEMPLATES = [
  { value: "default", label: "Default" },
  { value: "home", label: "Home" },
  { value: "about", label: "About" },
  { value: "approach", label: "Approach" },
  { value: "contact", label: "Contact" },
  { value: "landing", label: "Landing" },
];

export function PageForm({
  values = {},
  errors,
  submitLabel,
}: {
  values?: PageValues;
  errors?: FormErrors;
  submitLabel: string;
}) {
  const nav = useNavigation();
  const fe = errors?.fieldErrors ?? {};
  const format = values.bodyFormat ?? useEditorChoice();
  return (
    <Form method="post" className="max-w-2xl space-y-5">
      {errors?.formError && <p className="text-sm text-red-600">{errors.formError}</p>}
      <TextField name="title" label="Title" defaultValue={values.title} required error={fe.title} />
      <TextField name="slug" label="Slug" defaultValue={values.slug} error={fe.slug} hint="Leave blank on create to auto-generate." />
      <SelectField name="status" label="Status" options={STATUS} defaultValue={values.status ?? "draft"} error={fe.status} />
      <SelectField name="template" label="Template" options={TEMPLATES} defaultValue={values.template ?? "default"} error={fe.template} />
      <TextareaField name="excerpt" label="Excerpt" defaultValue={values.excerpt} error={fe.excerpt} />
      <Field label="Body" error={fe.body}>
        <RichTextEditor name="body" format={format} initialContent={values.body} />
      </Field>
      <MediaField name="coverImage" label="Cover image" defaultValue={values.coverImage} />
      <fieldset className="space-y-4 rounded-md border border-gray-200 p-4 dark:border-gray-800">
        <legend className="px-1 text-sm font-medium">SEO</legend>
        <TextField name="seoTitle" label="Meta title" defaultValue={values.seoTitle} />
        <TextareaField name="seoDescription" label="Meta description" defaultValue={values.seoDescription} />
        <MediaField name="ogImage" label="OG image" defaultValue={values.ogImage} />
      </fieldset>
      <FormActions busy={nav.state !== "idle"} backTo="/admin/pages" submitLabel={submitLabel} />
    </Form>
  );
}
