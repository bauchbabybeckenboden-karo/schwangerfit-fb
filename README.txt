Schwangerfit — Fragebogen Deploy-Paket (eigenstaendig)
=======================================================

Zweck
-----
Dieses Paket ist fuer ein eigenes Netlify-Projekt fuer den
Schwangerfit-Fragebogen gedacht. Die index.html in diesem
Paket ist direkt der Schwangerfit-Fragebogen.

Schwangerfit ist KEIN Yogakurs, sondern ein Schwangerschafts-
Fitnesskurs. Das spiegelt sich im Branding ("Bauch · Baby ·
Beckenboden Schwangerfit"), in der Sprache der Texte und in
den Fragen wider (Notfallkontakt, Sportverbot, ET/SSW etc.).


Inhalt
------
- index.html                              → Schwangerfit-Fragebogen
                                            mit Logo
- logo.png                                → Logo (Cream auf transparent)
- netlify.toml                            → Netlify-Konfiguration
- netlify/functions/send-notification.js  → Mail-Versand-Function
                                            (erkennt fragebogen_typ "schwangerfit")


Sektionen
---------
1. Persoenliche Angaben    (Name, E-Mail, Telefon)
2. Schwangerschaft         (ET, SSW zu Kursbeginn, bereits Mutter,
                            Komplikationen, Sportverbot)
3. Notfallkontakt          (Name + Telefon)
4. Ueber dich              (Lieblingslied, wie aufmerksam geworden)
5. Einverstaendnis         (Datenschutz, Foto-Einwilligung,
                            Antirassismus)


Was die Empfaengerin in der Mail sieht
--------------------------------------
- Betreff: "Fragebogen Schwangerfit – [Name]"
- Eyebrow oberhalb: "Bauch · Baby · Beckenboden · Schwangerfit"
- Bei Sportverbot = "Ja" wird neben der Antwort ein roter
  "ACHTUNG"-Tag angezeigt, damit es sofort ins Auge faellt.


Hinweis zu Supabase
-------------------
Mehrere Schwangerfit-Felder haben in der bestehenden Tabelle
"fragebogen_antworten" noch keine Spalten und gehen daher nur
in die Mail, NICHT in Supabase:
  - et                  (Entbindungstermin)
  - ssw_kursbeginn      (Schwangerschaftswoche zu Kursbeginn)
  - sportverbot         (ja/nein)
  - notfall_name        (Notfallkontakt Name)
  - notfall_telefon     (Notfallkontakt Telefon)
  - lied                (Lieblingslied)
  - aufmerksam_geworden (wie auf Karoline aufmerksam geworden)

Wer diese Antworten auch in Supabase haben will, kann die
Spalten (Typ "text") in der Tabelle nachtraeglich anlegen.
Das ist im README von bbb-deploy-v3 ausfuehrlicher beschrieben.

Folgende Felder werden weiter in Supabase gespeichert, da sie
auf bestehende Spalten fallen:
  - name, email, telefon, einverstaendnis (Standard)
  - entbunden  (Wert "vaginal", "sektio" oder "nicht-entbunden")
  - geburtskomplikationen_text (das Komplikationen-Feld)


Deploy-Anleitung (Drag & Drop)
------------------------------

1. Den Ordner "bbb-deploy-schwangerfit" entpackt geoeffnet halten.

2. Netlify-Dashboard oeffnen → das gewuenschte Projekt auswaehlen
   (z. B. ein neu erstelltes "schwangerfitfragen") → "Deploys".

3. Den GESAMTEN Ordner per Drag & Drop in den Deploy-Bereich ziehen.
   Wichtig: NICHT nur einzelne Dateien, sondern den kompletten Ordner
   mit Unterstruktur (netlify/functions/...).

4. Warten, bis Netlify "Published" anzeigt.

5. RESEND_API_KEY pruefen:
   - Netlify → Site → Site configuration → Environment variables
   - Falls dort nicht vorhanden: hinzufuegen (gleicher Resend-API-Key
     wie auf den anderen Projekten, in Resend einsehbar oder neu
     anlegen).
   - Anschliessend einmal "Trigger deploy" → "Deploy site".

6. Aufrufen, ggf. mit Strg+F5 / Cmd+Shift+R.
