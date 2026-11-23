import { createServerFn } from "@tanstack/react-start";

export type RequestInput = {
  name: string;
  company: string;
  phone: string;
  pkg: string;
  maintenance: boolean;
  vision: string;
};

/** Danish number: 8 digits starting 2–9, optional +45 / 0045, spaces and dashes allowed. */
export const DK_PHONE = /^(?:(?:\+|00)45)?[2-9]\d{7}$/;

const TO = "farda0@protonmail.com";

export const sendRequest = createServerFn({ method: "POST" })
  .validator((input: RequestInput) => {
    const clean = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
    const data = {
      name: clean(input.name, 120),
      company: clean(input.company, 160),
      phone: clean(input.phone, 40).replace(/[\s-]/g, ""),
      pkg: clean(input.pkg, 60),
      maintenance: input.maintenance === true,
      vision: clean(input.vision, 5000),
    };
    if (!DK_PHONE.test(data.phone)) throw new Error("Invalid phone");
    if (!data.name || !data.company || !data.phone || !data.vision) throw new Error("Missing fields");
    return data;
  })
  .handler(async ({ data }) => {
    const key = process.env["RESEND_API_KEY"];
    if (!key) throw new Error("RESEND_API_KEY is not set");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "FARDA Website <onboarding@resend.dev>",
        to: [TO],
        subject: `Forespørgsel: ${data.pkg} – ${data.company}`,
        text: `Navn: ${data.name}\nVirksomhed: ${data.company}\nTelefon: ${data.phone}\nPakke: ${data.pkg}\nVedligehold (400 kr./md.): ${data.maintenance ? "Ja" : "Nej"}\n\nVision:\n${data.vision}\n`,
      }),
    });
    if (!res.ok) throw new Error(`Mail failed: ${res.status}`);
    return { ok: true };
  });
