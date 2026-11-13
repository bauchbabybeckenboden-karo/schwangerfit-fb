// netlify/functions/send-notification.mjs
// Schickt Karo eine Info-Mail (Layout Wunderwerk Frau), wenn ein Fragebogen eingeht.
// Für alle Fragebögen (Somatic Yoga, Schwangerfit, Mamafit, Beckenboden).
// Sicherheit: Mail nur an eine feste Adresse, nur einfache Feldnamen,
// gekürzte Texte, begrenzte Feldanzahl, HTML wird maskiert.

const EMPFAENGER = "bauch.baby.beckenboden@gmail.com";
const ABSENDER = "Karo · Bauch · Baby · Beckenboden <kontakt@bauch-baby-beckenboden.com>";
const LOGO = "https://raw.githubusercontent.com/bauchbabybeckenboden-karo/Logos/main/Clitlogo-creme.png";

const TYPEN = {
  soyo: "Somatic Yoga",
  schwangerfit: "Schwangerfit",
  mamafit: "Mamafit",
  beckenboden: "Somatic Beckenboden"
};

const LABELS = {
  eingereicht_am: "Eingereicht",
  name: "Name",
  email: "E-Mail",
  telefon: "Telefon",
  motivation: "Motivation",
  beschwerden: "Beschwerden",
  medikamente: "Medikamente",
  vorerfahrung: "Vorerfahrung",
  lebensphase: "Lebensphase",
  wuensche: "Wünsche",
  einverstaendnis: "Einverständnis",
  koerperbereiche_beachten: "Körperbereiche beachten",
  trauma: "Trauma",
  bereiche_vermeiden: "Bereiche vermeiden",
  stressreaktion: "Stressreaktion",
  et: "Errechneter Termin",
  ssw_kursbeginn: "SSW bei Kursbeginn",
  sportverbot: "Sportverbot",
  notfall_name: "Notfallkontakt",
  notfall_telefon: "Notfall-Telefon",
  lied: "Lieblingslied",
  aufmerksam_geworden: "Aufmerksam geworden durch",
  schwanger: "Schwanger",
  postnatal: "Nach der Geburt",
  trage: "Trage",
  trageberatung: "Trageberatung",
  rueckbildung: "Rückbildung"
};

// Diese Felder stehen oben in der Tabelle (wenn vorhanden)
const OBEN = ["eingereicht_am", "name", "email", "telefon"];
// Diese Felder kommen in den rosa Kasten "Zum Beachten in der Stunde"
const WICHTIG = [
  "sportverbot", "koerperbereiche_beachten", "trauma", "bereiche_vermeiden",
  "stressreaktion", "notfall_name", "notfall_telefon"
];
// Diese Felder werden nicht angezeigt
const VERSTECKT = ["fragebogen_typ", "packliste_link"];

const MAX_FELDER = 60;

const clean = (v, max = 3000) => {
  if (Array.isArray(v)) v = v.join(", ");
  else if (v && typeof v === "object") v = JSON.stringify(v);
  return String(v ?? "").replace(/\r/g, "").trim().slice(0, max) || "-";
};

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br/>");

const label = (f) =>
  LABELS[f] || f.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

function wert(d, f) {
  if (f === "eingereicht_am") {
    const t = new Date(d.eingereicht_am);
    if (!isNaN(t)) {
      return t.toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short" }) + " Uhr";
    }
  }
  return clean(d[f]);
}

const zeile = (lab, w) =>
  `<tr>
    <td valign="top" style="padding:10px 12px 10px 0;width:170px;border-bottom:1px solid #E8D5D0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;letter-spacing:1px;text-transform:uppercase;color:#8B6464;">${esc(lab)}</td>
    <td valign="top" style="padding:10px 0;border-bottom:1px solid #E8D5D0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#3D2B2B;">${esc(w)}</td>
  </tr>`;

// Felder sortieren: oben, dann alle übrigen in der Reihenfolge der Seite
function felder(d) {
  const erlaubt = Object.keys(d)
    .filter((k) => /^[a-z0-9_]{1,40}$/.test(k) && !VERSTECKT.includes(k))
    .slice(0, MAX_FELDER);
  const oben = OBEN.filter((k) => erlaubt.includes(k));
  const wichtig = WICHTIG.filter((k) => erlaubt.includes(k));
  const rest = erlaubt.filter((k) => !OBEN.includes(k) && !WICHTIG.includes(k));
  return { normal: [...oben, ...rest], wichtig };
}

function baueHtml(d, typ, name, f) {
  const normal = f.normal.map((k) => zeile(label(k), wert(d, k))).join("");
  const wichtig = f.wichtig.map((k) => zeile(label(k), wert(d, k))).join("");
  const kasten = wichtig
    ? `<tr><td style="padding:12px 36px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#E8D5D0" style="background:#E8D5D0;border-left:4px solid #8B6464;"><tr><td style="padding:14px 20px;">
      <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;letter-spacing:1px;text-transform:uppercase;color:#8B6464;">Zum Beachten in der Stunde</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${wichtig}</table>
    </td></tr></table>
  </td></tr>`
    : `<tr><td style="padding:0 36px 24px;">&nbsp;</td></tr>`;
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F6EBE8;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F6EBE8"><tr><td align="center" style="padding:30px 12px;">
<table role="presentation" width="620" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:620px;background:#F3E9E5;border:1px solid #E8D5D0;">
  <tr><td bgcolor="#8B6464" style="background:#8B6464;padding:30px 36px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td valign="middle" style="padding:0 18px 0 0;"><img src="${LOGO}" width="44" height="88" alt="" style="display:block;width:44px;height:88px;border:0;"/></td>
      <td valign="middle">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;letter-spacing:1px;text-transform:uppercase;color:#E8D5D0;">Neuer Fragebogen &middot; ${esc(typ)}</p>
        <h1 style="margin:6px 0 0;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:28px;line-height:34px;color:#FBF6F3;">${esc(name)}</h1>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:28px 36px 8px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${normal}</table>
  </td></tr>
  ${kasten}
  <tr><td bgcolor="#8B6464" align="center" style="background:#8B6464;padding:26px 36px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:#F3E9E5;text-align:center;">
    <div style="font-family:Georgia,serif;font-size:20px;letter-spacing:1px;color:#F3E9E5;">Wunderwerk Frau</div>
    <div style="width:140px;height:1px;background:#F3E9E5;margin:6px auto;line-height:1px;font-size:1px;">&nbsp;</div>
    <div style="font-size:11px;letter-spacing:3px;color:#F3E9E5;margin-bottom:12px;">BAUCH &middot; BABY &middot; BECKENBODEN</div>
    <a href="https://www.wunderwerk-frau.de" style="color:#F3E9E5;text-decoration:underline;">www.wunderwerk-frau.de</a>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY fehlt in den Netlify-Variablen");
    return new Response("RESEND_API_KEY fehlt", { status: 500 });
  }

  let d;
  try {
    d = await req.json();
  } catch {
    return new Response("Ungueltige Daten", { status: 400 });
  }
  if (!d || typeof d !== "object" || Array.isArray(d) || !d.name || !d.email) {
    return new Response("Name und E-Mail fehlen", { status: 400 });
  }

  const typ = TYPEN[d.fragebogen_typ] || "Fragebogen";
  const name = clean(d.name, 80).replace(/\s+/g, " ");
  const betreff = `Neuer Fragebogen - ${typ} - ${name}`;
  const f = felder(d);

  const text = [
    `Neuer Fragebogen - ${typ}`, "",
    ...f.normal.map((k) => `${label(k)}: ${wert(d, k)}`),
    "", "ZUM BEACHTEN IN DER STUNDE",
    ...f.wichtig.map((k) => `${label(k)}: ${wert(d, k)}`)
  ].join("\n");

  const mail = {
    from: ABSENDER,
    to: [EMPFAENGER],
    subject: betreff,
    html: baueHtml(d, typ, name, f),
    text
  };
  const email = clean(d.email, 200);
  if (/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) {
    mail.reply_to = email;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(mail)
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend Fehler:", res.status, err);
    return new Response("Mailversand fehlgeschlagen", { status: 502 });
  }
  return new Response("OK", { status: 200 });
};
