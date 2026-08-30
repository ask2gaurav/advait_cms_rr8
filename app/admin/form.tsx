import type { ReactNode } from "react";
import { Link } from "react-router";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select } from "~/components/ui/select";
import { Button } from "~/components/ui/button";

export function LinkButton({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex h-9 items-center rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200"
    >
      {children}
    </Link>
  );
}

export function PageHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {action}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function TextField({
  name,
  label,
  defaultValue,
  error,
  hint,
  required,
  type = "text",
}: {
  name: string;
  label: string;
  defaultValue?: string | number;
  error?: string;
  hint?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <Field label={label} htmlFor={name} error={error} hint={hint}>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
      />
    </Field>
  );
}

export function TextareaField({
  name,
  label,
  defaultValue,
  error,
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
}) {
  return (
    <Field label={label} htmlFor={name} error={error} hint={hint}>
      <Textarea id={name} name={name} defaultValue={defaultValue} />
    </Field>
  );
}

export function SelectField({
  name,
  label,
  options,
  defaultValue,
  error,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  error?: string;
}) {
  return (
    <Field label={label} htmlFor={name} error={error}>
      <Select id={name} name={name} defaultValue={defaultValue}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}

export function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} value="true" />
      {label}
    </label>
  );
}

export function FormActions({
  busy,
  backTo,
  submitLabel = "Save",
}: {
  busy?: boolean;
  backTo: string;
  submitLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : submitLabel}
      </Button>
      <Link
        to={backTo}
        className="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        Cancel
      </Link>
    </div>
  );
}
