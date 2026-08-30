import { Form, useNavigation } from "react-router";
import type { FormErrors } from "~/lib/admin.server";
import type { CaseStudyValues } from "~/lib/case-studies.server";
import {
  Field,
  FormActions,
  SelectField,
  TextField,
  TextareaField,
  CheckboxField,
} from "~/admin/form";
import { RichTextEditor } from "~/admin/RichTextEditor";
import { MediaField } from "~/admin/MediaField";

const STATUS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export function CaseStudyForm({
  values = {},
  errors,
  submitLabel,
}: {
  values?: CaseStudyValues;
  errors?: FormErrors;
  submitLabel: string;
}) {
  const nav = useNavigation();
  const fe = errors?.fieldErrors ?? {};
  return (
    <Form method="post" className="max-w-2xl space-y-5">
      {errors?.formError && <p className="text-sm text-red-600">{errors.formError}</p>}
      <TextField name="title" label="Title" defaultValue={values.title} required error={fe.title} />
      <TextField name="slug" label="Slug" defaultValue={values.slug} error={fe.slug} hint="Leave blank on create to auto-generate." />
      <SelectField name="status" label="Status" options={STATUS} defaultValue={values.status ?? "draft"} error={fe.status} />
      <TextareaField name="excerpt" label="Excerpt" defaultValue={values.excerpt} error={fe.excerpt} />
      <Field label="Body" error={fe.body}>
        <RichTextEditor name="body" initialContent={values.body} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <TextField name="client" label="Client" defaultValue={values.client} />
        <TextField name="industry" label="Industry" defaultValue={values.industry} />
        <TextField name="year" label="Year" type="number" defaultValue={values.year} error={fe.year} />
        <TextField name="order" label="Order" type="number" defaultValue={values.order} />
      </div>
      <TextField name="services" label="Services" defaultValue={values.services?.join(", ")} hint="Comma-separated" />
      <TextField name="url" label="Live URL" defaultValue={values.url} error={fe.url} />
      <MediaField name="coverImage" label="Cover image" defaultValue={values.coverImage} />
      <TextField name="gallery" label="Gallery image IDs" defaultValue={values.gallery?.join(", ")} hint="Comma-separated media ids (bulk picker planned)" />
      <CheckboxField name="featured" label="Featured" defaultChecked={values.featured} />
      <fieldset className="space-y-4 rounded-md border border-gray-200 p-4 dark:border-gray-800">
        <legend className="px-1 text-sm font-medium">SEO</legend>
        <TextField name="seoTitle" label="Meta title" defaultValue={values.seoTitle} />
        <TextareaField name="seoDescription" label="Meta description" defaultValue={values.seoDescription} />
        <MediaField name="ogImage" label="OG image" defaultValue={values.ogImage} />
      </fieldset>
      <FormActions busy={nav.state !== "idle"} backTo="/admin/case-studies" submitLabel={submitLabel} />
    </Form>
  );
}
