import { connectDb } from "~/lib/db.server";
import { CompanyHistory } from "~/lib/models/company-history.server";
import {
  companyAddressesSchema,
  companyHistorySchema,
  companyLogosSchema,
  parseForm,
} from "~/lib/validation";
import { parseJsonField } from "~/lib/admin.server";

const KEY = "company-history";

export interface CompanyHistoryValues {
  intro?: string;
  addressesJson?: string;
  logosJson?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export async function getCompanyHistoryValues(): Promise<CompanyHistoryValues> {
  await connectDb();
  const d = await CompanyHistory.findOne({ key: KEY }).lean();
  return {
    intro: d?.intro,
    addressesJson: JSON.stringify(d?.addresses ?? [], null, 2),
    logosJson: JSON.stringify(
      (d?.logos ?? []).map((l) => ({
        ...l,
        image: l.image ? String(l.image) : "",
      })),
      null,
      2,
    ),
    seoTitle: d?.seoTitle,
    seoDescription: d?.seoDescription,
  };
}

export async function saveCompanyHistory(form: FormData) {
  await connectDb();
  const input = parseForm(companyHistorySchema, form);
  const addresses = parseJsonField(
    form,
    "addressesJson",
    companyAddressesSchema,
  );
  const logos = parseJsonField(form, "logosJson", companyLogosSchema).map(
    (l) => ({ ...l, image: l.image || undefined }),
  );

  await CompanyHistory.findOneAndUpdate(
    { key: KEY },
    {
      $set: {
        intro: input.intro || undefined,
        addresses,
        logos,
        seoTitle: input.seoTitle || undefined,
        seoDescription: input.seoDescription || undefined,
      },
    },
    { upsert: true },
  );
}
