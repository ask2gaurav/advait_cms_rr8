import { Form, useNavigation } from "react-router";
import type { FormErrors } from "~/lib/admin.server";
import type { UserValues } from "~/lib/users.server";
import { FormActions, SelectField, TextField, CheckboxField } from "~/admin/form";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "master", label: "Master" },
];

export function UserForm({
  values = {},
  errors,
  submitLabel,
  isNew,
}: {
  values?: UserValues;
  errors?: FormErrors;
  submitLabel: string;
  isNew: boolean;
}) {
  const nav = useNavigation();
  const fe = errors?.fieldErrors ?? {};
  return (
    <Form method="post" className="max-w-md space-y-5">
      {errors?.formError && <p className="text-sm text-red-600">{errors.formError}</p>}
      <TextField name="name" label="Name" defaultValue={values.name} required error={fe.name} />
      <TextField name="email" label="Email" type="email" defaultValue={values.email} required error={fe.email} />
      <SelectField name="role" label="Role" options={ROLES} defaultValue={values.role ?? "admin"} error={fe.role} />
      <TextField
        name="password"
        label={isNew ? "Password" : "New password"}
        type="password"
        error={fe.password}
        hint={isNew ? "At least 8 characters." : "Leave blank to keep current password."}
      />
      <CheckboxField name="active" label="Active" defaultChecked={values.active ?? true} />
      <FormActions busy={nav.state !== "idle"} backTo="/admin/users" submitLabel={submitLabel} />
    </Form>
  );
}
