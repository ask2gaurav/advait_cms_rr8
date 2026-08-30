import { Form, useNavigation } from "react-router";
import type { FormErrors } from "~/lib/admin.server";
import {
  Field,
  FormActions,
  SelectField,
  TextField,
  TextareaField,
  CheckboxField,
} from "~/admin/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { RichTextEditor } from "~/admin/RichTextEditor";
import { MediaField } from "~/admin/MediaField";

export interface PostValues {
  title?: string;
  slug?: string;
  status?: string;
  excerpt?: string;
  body?: unknown[];
  coverImage?: string;
  ogImage?: string;
  tags?: string[];
  categories?: string[];
  author?: string;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

const STATUS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export function PostForm({
  values = {},
  errors,
  submitLabel,
}: {
  values?: PostValues;
  errors?: FormErrors;
  submitLabel: string;
}) {
  const nav = useNavigation();
  const fe = errors?.fieldErrors ?? {};

  return (
    <Form method="post" className="max-w-2xl space-y-5">
      {errors?.formError && (
        <p className="text-sm text-red-600">{errors.formError}</p>
      )}
      <TextField name="title" label="Title" defaultValue={values.title} required error={fe.title} />
      <TextField
        name="slug"
        label="Slug"
        defaultValue={values.slug}
        error={fe.slug}
        hint="Lowercase, dashes. Leave blank on create to auto-generate."
      />
      <SelectField name="status" label="Status" options={STATUS} defaultValue={values.status ?? "draft"} error={fe.status} />
      <TextareaField name="excerpt" label="Excerpt" defaultValue={values.excerpt} error={fe.excerpt} />

      <Field label="Body" error={fe.body}>
        <RichTextEditor name="body" initialContent={values.body} />
      </Field>

      <TextField name="tags" label="Tags" defaultValue={values.tags?.join(", ")} hint="Comma-separated" />
      <TextField name="categories" label="Categories" defaultValue={values.categories?.join(", ")} hint="Comma-separated" />
      <TextField name="author" label="Author" defaultValue={values.author} />
      <MediaField name="coverImage" label="Cover image" defaultValue={values.coverImage} />
      <CheckboxField name="featured" label="Featured" defaultChecked={values.featured} />

      <fieldset className="space-y-4 rounded-md border border-gray-200 p-4 dark:border-gray-800">
        <legend className="px-1 text-sm font-medium">SEO</legend>
        <TextField name="seoTitle" label="Meta title" defaultValue={values.seoTitle} />
        <TextareaField name="seoDescription" label="Meta description" defaultValue={values.seoDescription} />
        <MediaField name="ogImage" label="OG image" defaultValue={values.ogImage} />
      </fieldset>

      <FormActions busy={nav.state !== "idle"} backTo="/admin/posts" submitLabel={submitLabel} />
    </Form>
  );
}
