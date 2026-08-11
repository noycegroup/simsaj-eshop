import "server-only";
import { createHash } from "node:crypto";

const DEFAULT_API_URL = "https://api.mygls.sk/ParcelService.svc/json/PrintLabels";

type GlsAddress = { name: string; street: string; city: string; postalCode: string; countryCode?: string; contactName: string; phone: string; email: string };
type GlsLabelRequest = { orderNumber: string; address: GlsAddress; parcelCount?: number; cashOnDelivery?: number };

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Chýba serverová konfigurácia ${name}.`);
  return value;
}

function splitStreet(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  const match = normalized.match(/^(.*?)[,\s]+(\d+[A-Za-z]?(?:\s*[/\-]\s*\d+[A-Za-z]?)?)$/u);
  return match ? { street: match[1].trim(), houseNumber: match[2].replace(/\s+/g, "") } : { street: normalized, houseNumber: "-" };
}

export async function createGlsLabel(input: GlsLabelRequest) {
  const clientNumber = Number(required("GLS_CLIENT_NUMBER"));
  if (!Number.isSafeInteger(clientNumber) || clientNumber <= 0) throw new Error("GLS_CLIENT_NUMBER nie je platné.");
  const username = required("GLS_USERNAME");
  const password = required("GLS_PASSWORD");
  const apiUrl = process.env.GLS_API_URL?.trim() || DEFAULT_API_URL;
  const parsed = new URL(apiUrl);
  if (parsed.protocol !== "https:") throw new Error("GLS API musí používať HTTPS.");
  const { street, houseNumber } = splitStreet(input.address.street);
  const response = await fetch(parsed, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({
      Username: username,
      Password: Array.from(createHash("sha512").update(password, "utf8").digest()),
      ClientNumberList: [clientNumber],
      WebshopEngine: process.env.GLS_WEBSHOP_ENGINE?.trim() || "simsaj.sk",
      ParcelList: [{
        ClientNumber: clientNumber,
        ClientReference: input.orderNumber.slice(0, 40),
        Count: Math.max(1, Math.min(99, input.parcelCount ?? 1)),
        DeliveryAddress: { City: input.address.city, ContactEmail: input.address.email, ContactName: input.address.contactName, ContactPhone: input.address.phone, CountryIsoCode: input.address.countryCode || "SK", HouseNumber: houseNumber, Name: input.address.name, Street: street, ZipCode: input.address.postalCode.replace(/\s+/g, "") },
        ServiceList: input.cashOnDelivery && input.cashOnDelivery > 0 ? [{ Code: "COD", CODParameter: { Amount: input.cashOnDelivery, Currency: "EUR" } }] : [],
      }],
    }),
  });
  const data = await response.json() as { Labels?: number[]; PrintLabelsErrorList?: { ErrorCode?: number; ErrorDescription?: string }[]; PrintLabelsInfoList?: { ParcelId?: number; ParcelNumber?: number | string }[] };
  if (!response.ok || data.PrintLabelsErrorList?.length || !data.Labels?.length) throw new Error(data.PrintLabelsErrorList?.map((error) => `GLS ${error.ErrorCode ?? ""}: ${error.ErrorDescription ?? "chyba"}`).join("; ") || "GLS nevytvorilo štítok.");
  return { pdf: Uint8Array.from(data.Labels), parcelId: data.PrintLabelsInfoList?.[0]?.ParcelId ?? null, parcelNumber: String(data.PrintLabelsInfoList?.[0]?.ParcelNumber ?? "") || null };
}
