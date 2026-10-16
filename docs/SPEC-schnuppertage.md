# SPEC: Schnuppertage, Freischaltung der Bewerbung & Abschluss der Bewerbungsphase

Status: Entwurf · Stand: 2026-10-16

## 1. Ziel

Das Bewerberportal wird künftig schon **vor** der Bewerbungsphase auf der HTL-Homepage verlinkt. Interessierte legen ein Bewerberkonto an und melden sich damit zu **Schnuppertagen** der einzelnen Fachrichtungen an. Das **Bewerbungsformular** wird erst später von einem Admin **manuell freigeschaltet**. Nach Ende der Bewerbungsphase räumt ein Admin die Daten in einem Schritt auf.

Drei Teilfunktionen:

1. **Schnuppertage**: Termine pro Fachrichtung, Anmeldung mit Kontingent und Warteliste, Storno/Umbuchung, Verwaltung durch die Administration (inkl. Anmeldung durch die Verwaltung).
2. **Freischaltung Bewerbung**: globaler Schalter (nur Admin), der steuert, ob Bewerber:innen das Bewerbungsformular sehen und bearbeiten können.
3. **Abschluss der Bewerbungsphase**: Admin-Aktion, die nicht abgegebene Konten löscht, die übrigen Bewerbungen anonymisiert, die Schnupperdaten löscht und die Bewerbung sperrt.

**Voraussetzung (separat, vorab):** Die Applicant-Endpunkte bekommen eine Prüfung von `userType` bzw. Eigentümer:in, denn `PATCH /api/applicant/:id` prüft derzeit nicht, ob Bewerber:innen nur ihr eigenes Konto ändern. Der dafür eingeführte Guard bzw. Decorator wird hier mitbenutzt.

## 2. Entscheidungen aus dem Interview

| Thema | Entscheidung |
|---|---|
| Konto | Schnupper-Anmeldung nur mit Bewerberkonto (Registrierung + bestätigte E-Mail) |
| Fachrichtung | Bestehende `SchoolClass`-Einträge; beim Anlegen nur `active = true` wählbar |
| Terminstruktur | Pro Fachrichtung mehrere Termine, jeder mit eigener max. Teilnehmerzahl |
| Anzahl | Pro Person höchstens **eine aktive Anmeldung pro Fachrichtung**; mehrere Fachrichtungen möglich |
| Pflichtdaten vorab | Nur Konto + bestätigte E-Mail |
| Formularfelder | Vor-/Nachname, aktuelle Schule, Klasse, Telefon Erziehungsberechtigte:r, **Bemerkung** (neutral, keine gezielte Abfrage von Gesundheitsdaten) |
| DSGVO | Bestehende Einwilligung `Applicant.dsgvo` mit einem um das Schnuppern erweiterten Datenschutztext |
| Termin voll | Warteliste; automatisches Nachrücken + E-Mail bis Terminbeginn (auch nach dem Anmeldeschluss) |
| Anmeldezeitraum | Pro Termin ein Anmeldeschluss |
| Storno/Umbuchung | Durch Bewerber:in selbst bis zum Anmeldeschluss; danach nur durch die Verwaltung |
| E-Mails | Anmeldebestätigung (inkl. Warteliste), Storno-Bestätigung, Nachrück-Info, Einladung |
| Verwaltung | Alle Verwaltungs-User (`userType = administration`) |
| Anmeldung durch Verwaltung | Möglich, auch für Personen ohne Konto: Das Konto wird angelegt und eine Einladungsmail zum Setzen des Passworts versendet. Volle Termine dürfen überbucht werden. |
| Durchführung | Teilnehmerliste pro Termin (Ansicht) |
| Bewerberübersicht | Reine Schnupperer standardmäßig ausgeblendet, per Filter einblendbar |
| Bezug zur Bewerbung | Schnupper-Anmeldungen in der Bewerber-Detailansicht nur angezeigt; kein Einfluss auf die Reihung |
| UI Bewerber:innen | Eigene Seite `/trial-days` |
| Freischaltung | Globaler Ein/Aus-Schalter, nur Admins; betrifft nur die Bewerber-Sicht, nicht die Verwaltung |
| Gesperrtes Formular | `/home` zeigt einen Hinweis mit Link zu `/trial-days`; das Backend lehnt Änderungen an Bewerbungsdaten durch Bewerber:innen ab |
| Abschluss | **Eine** Admin-Aktion: `created`-Konten löschen, alle anderen anonymisieren (Wohnort und Vorschule bleiben), alle Schnupperdaten löschen, Bewerbung sperren |

## 3. Datenmodell (`backend/prisma/schema.prisma`)

### 3.1 `TrialDay` (Schnuppertermin)

```prisma
model TrialDay {
    id                    String        @id @default(auto()) @map("_id") @db.ObjectId
    schema                Int           @default(1)

    schoolClass           SchoolClass   @relation(fields: [schoolClassID], references: [id])
    schoolClassID         String        @db.ObjectId

    startAt               DateTime      // Datum + Uhrzeit von
    endAt                 DateTime      // Datum + Uhrzeit bis (gleicher Tag)
    maxParticipants       Int
    registrationDeadline  DateTime      // Anmelde- und Storno-Schluss
    description           String?       // Hinweise (Ablauf, Mitbringen …), auch in der Bestätigungs-Mail
    active                Boolean       @default(false)  // erst nach Freischaltung für Bewerber:innen sichtbar

    registrations         TrialDayRegistration[]

    createdAt             DateTime      @default(now())
}
```

`SchoolClass` bekommt die Rückrelation `trialDays TrialDay[]`.

### 3.2 `TrialDayRegistration` (Schnupper-Anmeldung)

```prisma
model TrialDayRegistration {
    id              String      @id @default(auto()) @map("_id") @db.ObjectId
    schema          Int         @default(1)

    trialDay        TrialDay    @relation(fields: [trialDayID], references: [id], onDelete: Cascade)
    trialDayID      String      @db.ObjectId

    applicant       Applicant   @relation(fields: [applicantID], references: [id], onDelete: Cascade)
    applicantID     String      @db.ObjectId

    statusKey       String      @default("registered") // TrialDayRegistrationStatus

    currentClass    String?     // z.B. "4b"
    guardianPhone   String
    annotation      String?     // Bemerkung

    createdBy       String      @default("applicant")   // 'applicant' | 'administration'
    createdAt       DateTime    @default(now())   // bestimmt die Reihenfolge der Warteliste
    cancelledAt     DateTime?
    cancelledBy     String?     // 'applicant' | 'administration'
}
```

`Applicant` bekommt die Rückrelation `trialDayRegistrations TrialDayRegistration[]`.

**Name und Schule** werden nicht in der Anmeldung gespeichert, sondern in `Applicant.details` (`firstname`, `lastname`, `previousSchoolTxt`), damit sie später im Bewerbungsformular vorbefüllt sind.

### 3.3 Erweiterung `Applicant`

```prisma
    anonymizedAt    DateTime?   // gesetzt durch "Bewerbungsphase abschließen"
```

`passwordHash` ist bereits optional. Ein Konto ohne Passwort ist ein von der Verwaltung angelegtes, noch nicht aktiviertes Konto (siehe 4.8).

### 3.4 Lookup `TrialDayRegistrationStatus` (Seed)

Wie die anderen Lookup-Tabellen, per `key` referenziert:

| key | title | pos |
|---|---|---|
| `registered` | angemeldet | 1 |
| `waiting` | Warteliste | 2 |
| `cancelled` | storniert | 3 |

Eine Anmeldung ist **aktiv**, wenn `statusKey ∈ {registered, waiting}`.

### 3.5 `Setting` (globale Einstellungen)

```prisma
model Setting {
    id      String  @id @default(auto()) @map("_id") @db.ObjectId
    schema  Int     @default(1)

    key     String  @unique
    value   Json
}
```

Im Seed: `{ key: "applicationOpen", value: false }` per `upsert` mit leerem `update`, damit ein bestehender Wert nicht überschrieben wird.

## 4. Geschäftsregeln

### 4.1 Anmeldung durch Bewerber:in
- Voraussetzung: eingeloggte:r Bewerber:in mit bestätigter E-Mail (`EmailConfirmationGuard`).
- Ist `Applicant.dsgvo = false`, muss im Anmeldeformular die DSGVO-Einwilligung angehakt werden. Danach wird `dsgvo = true` gesetzt (siehe 4.9).
- Buchbar ist ein Termin nur, wenn `active = true`, `now < registrationDeadline` und `startAt` in der Zukunft liegt.
- Pro Bewerber:in und `schoolClassID` ist höchstens **eine aktive Anmeldung** erlaubt. Prüfung im Service, da MongoDB/Prisma keinen partiellen Unique-Index abbildet.
- Ist `count(registered) < maxParticipants`, wird die Anmeldung `registered`, sonst `waiting`.
- Kapazitätsprüfung und Anlage laufen in einem `prisma.$transaction`, damit gleichzeitige Anmeldungen das Kontingent nicht überschreiten.
- Die eingegebenen Namens- und Schulangaben werden in `Applicant.details` geschrieben bzw. aktualisiert.
- Danach wird eine Anmeldebestätigung per E-Mail versendet (Variante „angemeldet“ bzw. „Warteliste, Position X“).

### 4.2 Storno durch Bewerber:in
- Nur für eigene, aktive Anmeldungen und nur bis `registrationDeadline`.
- Status → `cancelled`, `cancelledAt` und `cancelledBy = 'applicant'` setzen. Die Anmeldung wird nicht gelöscht, damit die Historie erhalten bleibt.
- Danach wird eine Storno-Bestätigung per E-Mail versendet.
- War die Anmeldung `registered`, folgt das Nachrücken (4.4).

### 4.3 Umbuchung durch Bewerber:in
- Wechsel auf einen anderen Termin **derselben Fachrichtung**.
- Bis zum Anmeldeschluss des alten **und** des neuen Termins.
- Ablauf in einer Transaktion: alte Anmeldung stornieren, neue nach Regel 4.1 anlegen (ggf. auf der Warteliste), dann Nachrücken für den alten Termin.
- Es wird eine E-Mail versendet: eine Anmeldebestätigung für den neuen Termin mit dem Hinweis auf die Stornierung des alten.

### 4.4 Warteliste / Nachrücken
- Wird ein Platz frei (Storno, Umbuchung, Erhöhung von `maxParticipants`), rücken die ältesten `waiting`-Anmeldungen (nach `createdAt`) automatisch auf `registered` nach, bis der Termin voll ist.
- Jede nachgerückte Person bekommt eine E-Mail.
- Nachrücken findet **bis zum Terminbeginn** (`startAt`) statt, also auch nach dem Anmeldeschluss.
- Die Wartelistenposition wird zur Laufzeit berechnet (Rang nach `createdAt` unter den `waiting`-Anmeldungen) und nicht gespeichert.

### 4.5 Verwaltung von Terminen und Anmeldungen
- Termine anlegen und bearbeiten: Als Fachrichtung sind nur `SchoolClass` mit `active = true` wählbar, Anzeige „Titel (Jahrgang)“. Alle Felder sind änderbar. `maxParticipants` darf nicht unter die aktuelle Anzahl `registered` gesenkt werden, sonst gibt es einen Fehler.
- Termin löschen: nur möglich, wenn es keine (auch keine stornierten) Anmeldungen gibt. Andernfalls wird der Termin über `active = false` ausgeblendet.
- Ein deaktivierter Termin ist für Bewerber:innen nicht mehr buchbar. Bestehende Anmeldungen bleiben in „Meine Anmeldungen“ sichtbar.
- Die Verwaltung kann Anmeldungen jederzeit stornieren (auch nach dem Anmeldeschluss). Dabei gilt `cancelledBy = 'administration'`, eine Storno-Mail wird versendet und die Warteliste rückt nach.
- **Anmeldung durch die Verwaltung** (z.B. nach Anruf):
  - Person suchen (E-Mail/Name) **oder** neu erfassen: E-Mail, Vor-/Nachname, Schule, Klasse, Telefon, Bemerkung.
  - Existiert zur E-Mail noch kein Konto, wird eines ohne Passwort angelegt (`emailConfirmed = false`) und eine Einladungsmail versendet (4.8).
  - Die Regel „eine aktive Anmeldung pro Fachrichtung“ gilt weiterhin. Der **Anmeldeschluss wird ignoriert**.
  - Ist der Termin voll, kommt die Person standardmäßig auf die Warteliste. Mit der Option **„Überbuchen“** wird sie trotzdem fix angemeldet (`registered`), auch über `maxParticipants` hinaus. Solange der Termin überbucht ist, rückt niemand von der Warteliste nach.
  - Es gilt `createdBy = 'administration'`; eine Anmeldebestätigung wird versendet.

### 4.6 Freischaltung des Bewerbungsformulars
- `Setting applicationOpen` (Boolean) kann nur von Admins (`userRoleKey = admin`) geändert werden.
- Bei `applicationOpen = false` gilt nur für Bewerber:innen:
  - Das Backend lehnt schreibende Zugriffe auf Bewerbungsdaten mit `403` und einem neuen `ApiErrorType` (z.B. `APPLICATION_CLOSED`, Meldung „Die Bewerbung ist derzeit nicht freigeschaltet.“) ab. Betroffen sind `PATCH /api/applicant/:id`, Contacts, Applications, SchoolReport und die Abgabe.
  - **Ausnahme**: Die Schnupper-Anmeldung darf `details.firstname`, `details.lastname`, `details.previousSchoolTxt` und `dsgvo` weiterhin schreiben. Das geschieht über den Trial-Day-Endpunkt, nicht über `PATCH /applicant`.
  - `GET /api/applicant/current` bleibt erlaubt.
- Die Verwaltung ist **nicht** betroffen und kann alle Daten wie bisher sehen und bearbeiten.

### 4.7 Bewerberübersicht (`/applicants`)
- Als **reine Schnupperer** gelten Personen mit `statusKey = 'created'`, ohne `Application` und mit mindestens einer `TrialDayRegistration`.
- Diese Personen werden standardmäßig ausgeblendet. Das geschieht im `buildWhereClause` in `applicant.controller.ts`, ergänzend zum bestehenden Ausschluss von `completed`.
- Ein neuer Filter „nur Schnupperer“ zeigt ausschließlich diese Gruppe.
- Sobald eine Bewerbung angelegt wird, erscheint die Person wieder normal in der Übersicht.

### 4.8 Einladung (Konto durch die Verwaltung angelegt)
- Die Einladungsmail enthält einen Link `/set-password?token=…`. Der Token ist HS256 und funktioniert wie der Bestätigungstoken in `EmailConfirmationService` (Payload `{ email, purpose: 'invite' }`) mit eigener, längerer Gültigkeit (z.B. 14 Tage; neue Env-Variable).
- Beim Setzen des Passworts werden `passwordHash` und `emailConfirmed = true` gesetzt. Danach geht es zum Login.
- Registriert sich jemand mit einer E-Mail, zu der ein Konto **ohne Passwort** existiert, kommt die Meldung „Für diese E-Mail wurde bereits ein Konto angelegt. Wir haben Ihnen den Link zum Festlegen des Passworts erneut gesendet.“ Die Einladungsmail wird erneut versendet.
- Die Verwaltung kann die Einladung in der Teilnehmerliste erneut senden, solange kein Passwort gesetzt ist.

### 4.9 DSGVO
- Der bestehende Datenschutztext (Dialog in `HomeTab.tsx`) wird um die Verarbeitung für Schnuppertage erweitert: welche Daten, Zweck, Speicherdauer bis zum Abschluss der Bewerbungsphase. Der Text wird als gemeinsame Komponente für die Bewerbung und `/trial-days` genutzt.
- Im Schnupper-Anmeldeformular erscheint die Checkbox nur, solange `Applicant.dsgvo = false` ist. Das betrifft auch Konten, die die Verwaltung angelegt hat: Die Einwilligung wird beim Setzen des Passworts eingeholt.
- Das Feld „Bemerkung“ trägt den Hinweistext „Wichtige Hinweise für den Schnuppertag“. Gesundheitsdaten werden nicht gezielt abgefragt.

### 4.10 Bewerbungsphase abschließen (Admin)
Eine Aktion auf `/settings`, nur für Admins, **nicht rückgängig zu machen**.

**Vorschau** (vor der Bestätigung):
- Anzahl der zu löschenden `created`-Konten.
- Anzahl der zu anonymisierenden Bewerbungen.
- Anzahl der zu löschenden Schnupper-Anmeldungen und Termine.
- Hinweis, falls noch zukünftige Schnuppertermine Anmeldungen haben.
- Hinweis: „Haben Sie den Sokrates- und BTS-Export bereits durchgeführt?“

**Bestätigung** durch Eintippen von `ABSCHLIESSEN`.

**Ablauf** (in dieser Reihenfolge; idempotent, damit ein erneuter Lauf nach einem Abbruch gefahrlos ist):
1. `applicationOpen = false` setzen.
2. Alle `TrialDayRegistration` löschen, danach alle `TrialDay`.
3. Alle Applicants mit `statusKey = 'created'` löschen, inklusive Applications (Cascade).
4. Alle übrigen Applicants mit `anonymizedAt = null` anonymisieren:

| Bereich | Entfernt (auf `null` bzw. leer) | Bleibt erhalten |
|---|---|---|
| `Applicant` | `passwordHash`, `annotation`; `email` → Platzhalter `anonymisiert-<id>@invalid.local` (wegen `@unique`) | `statusKey`, `active`, `dsgvo`, `registeredAt`, `createdAt`; `anonymizedAt = now` |
| `details` | `firstname`, `moreFirstname`, `lastname`, `birthdate`, `svnr`, `svInstitution`, `placeOfBirth`, `religion`, `annotation` | `sex`, `nationality`, `language`, `countryOfBirth`, `schoolAge`, `boardingSchool`, `previousSchoolTxt`, `previousSchoolNum`, `previousSchoolAddress`, `secondChoiceSchool` |
| `contacts[]` | `title`, `degree`, `sufixDegree`, `firstname`, `moreFirstname`, `lastname`, `birthdate`, `svnr`, `street`, `streetNr`, `phone`, `email`, `annotation` | `contactTypeKey`, `country`, `zip`, `city`, Boolean-Flags |
| `schoolReport` | – | alle Noten und Gruppen |
| `Application` | – | unverändert (Fachrichtung, Priorität, Status) |

Mit dem Platzhalter ist kein Login mehr möglich, und die ursprüngliche E-Mail ist für eine neue Registrierung frei.

**Auswirkungen auf die Verwaltung:**
- Anonymisierte Bewerbungen werden in `/applicants` mit dem Hinweis „anonymisiert“ angezeigt.
- Das Bestätigungs-PDF ist für sie deaktiviert.
- Sie sind von den Sokrates- und BTS-Exporten ausgeschlossen.

## 5. API

Alle Routen liegen unter `/api` und brauchen einen JWT, sofern nicht anders angegeben. Die Trennung von Bewerber:innen und Verwaltung läuft über den Guard bzw. Decorator aus der Vorab-Umsetzung (z.B. `@UserType('administration')`, `@AdminOnly()`).

### Bewerber:innen (`userType = applicant`, E-Mail bestätigt)

| Methode | Route | Beschreibung |
|---|---|---|
| GET | `/trial-day` | Aktive, zukünftige Termine inkl. `schoolClass`, `registeredCount`, `waitingCount`, `bookable`. Keine personenbezogenen Daten. |
| GET | `/trial-day-registration/mine` | Eigene Anmeldungen inkl. Termin, Status und Wartelistenposition |
| POST | `/trial-day-registration` | Body: `trialDayID, firstname, lastname, school, currentClass, guardianPhone, annotation, dsgvo?` |
| POST | `/trial-day-registration/:id/cancel` | Eigene Anmeldung stornieren (4.2) |
| POST | `/trial-day-registration/:id/rebook` | Body: `trialDayID` (4.3) |

### Öffentlich (`@Public()`)

| Methode | Route | Beschreibung |
|---|---|---|
| GET | `/setting/applicationOpen` | `{ value: boolean }` – für die Weiterleitung nach dem Login |
| POST | `/applicant/set-password` | Body: `token, password, dsgvo` (4.8) |
| POST | `/applicant/register` | Erweitert: Existiert ein Konto ohne Passwort, wird die Einladung erneut versendet und ein eigener `ApiErrorType` zurückgegeben (4.8) |

### Verwaltung (`userType = administration`)

| Methode | Route | Beschreibung |
|---|---|---|
| GET | `/trial-day?all=true&schoolClass=&past=` | Alle Termine (auch inaktive/vergangene) mit Zählern |
| POST / PATCH / DELETE | `/trial-day[/:id]` | Termin anlegen, bearbeiten, löschen (4.5) |
| GET | `/trial-day/:id/registrations` | Teilnehmerliste: Name, Schule, Klasse, Telefon, Bemerkung, Status, Wartelistenposition, E-Mail, „Einladung offen“ |
| POST | `/trial-day/:id/registrations` | Anmeldung durch die Verwaltung. Body: `applicantID` **oder** `email, firstname, lastname`, dazu `school, currentClass, guardianPhone, annotation, overbook?` (4.5) |
| POST | `/trial-day-registration/:id/cancel` | Storno durch die Verwaltung (gleiche Route; das Verhalten hängt von `userType` ab) |
| POST | `/applicant/:id/resend-invitation` | Einladung erneut senden (4.8) |
| GET | `/applicant/:id` | Erweitert um `trialDayRegistrations` (inkl. Termin und Fachrichtung) |
| GET | `/applicant?onlyTrial=true` | Filter „nur Schnupperer“ (4.7) |

### Nur Admin

| Methode | Route | Beschreibung |
|---|---|---|
| PATCH | `/setting/applicationOpen` | Body `{ value: boolean }` |
| GET | `/application-phase/close/preview` | Zähler für die Vorschau (4.10) |
| POST | `/application-phase/close` | Body `{ confirmation: 'ABSCHLIESSEN' }` (4.10) |

Neue Nest-Module: `trial-day`, `trial-day-registration`, `trial-day-registration-status` (Lookup-GET wie bei den anderen), `setting` und `application-phase`.

## 6. E-Mails (`backend/src/templates/`)

| Template | Auslöser | Inhalt |
|---|---|---|
| `trial-registration.hbs` | Anmeldung, Umbuchung, Anmeldung durch die Verwaltung | Fachrichtung, Datum, Uhrzeit, `description`, Status (angemeldet / Warteliste Pos. X), Hinweis auf Storno bis Anmeldeschluss mit Link auf `/trial-days`; bei Umbuchung zusätzlich der alte, stornierte Termin |
| `trial-cancellation.hbs` | Storno durch Bewerber:in oder Verwaltung | Stornierter Termin, Hinweis, wer storniert hat |
| `trial-promotion.hbs` | Nachrücken von der Warteliste | „Ein Platz ist frei geworden, Sie sind jetzt fix angemeldet“ und die Termindaten |
| `invitation.hbs` | Konto durch die Verwaltung angelegt, erneutes Senden, Registrierungsversuch bei offener Einladung | Link zum Festlegen des Passworts und dessen Gültigkeit |

Empfänger ist die Konto-E-Mail (`Applicant.email`). Der Versand erfolgt wie bisher über `@nestjs-modules/mailer`. Ein Fehler beim Mailversand darf die Buchung nicht zurückrollen; er wird nur geloggt.

## 7. Frontend

### 7.1 Routing (`App.tsx`)

| Route | Schutz | Komponente |
|---|---|---|
| `/trial-days` | `applicant` | `TrialDays` – Schnupper-Anmeldung |
| `/set-password` | öffentlich | `SetPassword` – Passwort festlegen + DSGVO-Einwilligung (Einladung) |
| `/trial-days-admin` | `administration` | `TrialDaysAdmin` – Terminverwaltung und Teilnehmerlisten |
| `/settings` | `administration`, `admin` | `Settings` – Schalter „Bewerbung freigeschaltet“ und „Bewerbungsphase abschließen“ |

Nach dem Login (`SignInApplicant`) wird bei `applicationOpen` auf `/home` weitergeleitet, sonst auf `/trial-days`.

Navbar für Bewerber:innen: „Schnuppern“ und „Bewerbung“. „Bewerbung“ wird bei geschlossenem Formular ausgegraut oder führt zum Hinweis.

Navbar für die Verwaltung: neuer Eintrag „Schnuppertage“, für Admins zusätzlich „Einstellungen“.

### 7.2 Seite `/trial-days` (Bewerber:innen)
- **Meine Anmeldungen**: Fachrichtung, Datum, Uhrzeit, Status bzw. Wartelistenposition, Buttons „Stornieren“ und „Umbuchen“ (nur bis zum Anmeldeschluss), danach der Hinweis „Änderungen bitte direkt bei der Schule“.
- **Termine**, gruppiert nach Fachrichtung: Datum, Uhrzeit, Beschreibung, freie Plätze bzw. „ausgebucht – Anmeldung auf Warteliste“, Anmeldeschluss.
  - Fachrichtungen mit aktiver Anmeldung zeigen statt „Anmelden“ den Hinweis „bereits angemeldet“.
- **Anmeldeformular** (Modal, react-hook-form): Vorname*, Nachname*, aktuelle Schule*, Klasse, Telefon Erziehungsberechtigte:r*, Bemerkung. Name und Schule werden aus `details` vorbefüllt. Die DSGVO-Checkbox* erscheint nur, solange keine Einwilligung vorliegt.

### 7.3 Seite `/home` bei geschlossener Bewerbung
- Statt des Formulars erscheint ein Hinweis: „Die Online-Bewerbung ist noch nicht freigeschaltet. Melden Sie sich in der Zwischenzeit gerne zu einem Schnuppertag an.“ mit einem Button zu `/trial-days`.

### 7.4 Verwaltung `/trial-days-admin`
- Tabelle der Termine mit Filter nach Fachrichtung und „vergangene anzeigen“. Spalten: Fachrichtung, Datum, Uhrzeit, Anmeldeschluss, `angemeldet / max`, Warteliste, aktiv.
- Anlegen und Bearbeiten im Modal (Fachrichtung nur aus aktiven Klassen); Löschen gemäß 4.5.
- Detail- bzw. Aufklapp-Ansicht mit Teilnehmerliste (angemeldet und Warteliste getrennt; stornierte optional einblendbar):
  - Button „Stornieren“.
  - Badge „Einladung offen“ mit „Erneut senden“.
  - Button „Person anmelden“: Modal mit Suche nach bestehender Person oder Neuerfassung. Bei vollem Termin erscheint die Checkbox „Überbuchen (trotzdem fix anmelden)“.
- Ein Klick auf eine Person öffnet die Bewerber-Detailansicht (`/applicant?id=…`).

### 7.5 Bewerber-Detailansicht (Verwaltung)
- Neuer Abschnitt „Schnuppertage“ (nur lesend): Fachrichtung, Datum, Status, Telefon, Bemerkung.
- Anonymisierte Bewerbungen zeigen einen Hinweis-Banner.

### 7.6 Seite `/settings` (Admin)
- Schalter „Online-Bewerbung freigeschaltet“.
- Gefahrenbereich „Bewerbungsphase abschließen“ (4.10): Vorschau, Hinweis zum Export, Eingabefeld `ABSCHLIESSEN`, Button.

### 7.7 Models (`frontend/src/models/`)
- `trialDay.model.ts` (`@Entity('trialDay')` → `/trial-day`)
- `trialDayRegistration.model.ts` (`@Entity('trialDayRegistration')`)
- `Applicant` wird um `trialDayRegistrations?` und `anonymizedAt?` erweitert.

## 8. Nicht im Umfang

- Erinnerungsmails vor dem Termin (würde einen Scheduler erfordern)
- Benachrichtigung bei Terminänderung oder -absage
- Erfassen der Anwesenheit
- CSV- oder PDF-Export der Teilnehmerliste
- Einfluss auf die Reihung bzw. Punktezahl
- Zeitgesteuerte Freischaltung der Bewerbung (von/bis)
- Abteilungsbezogene Berechtigungen für Verwaltungs-User
- Protokoll der Abschluss-Aktion; Deaktivieren (`active = false`) anonymisierter Konten
- Fix der Eigentümer-Prüfung bei `PATCH /api/applicant/:id` (separate Umsetzung **vorab**, siehe 1.)

## 9. Akzeptanzkriterien

1. Ein neues Konto kann sich nach der E-Mail-Bestätigung bei geschlossener Bewerbung zu einem Schnuppertag anmelden (inkl. DSGVO-Einwilligung) und erhält eine Bestätigungsmail.
2. Eine zweite aktive Anmeldung zur selben Fachrichtung wird abgelehnt; eine Anmeldung zu einer anderen Fachrichtung funktioniert.
3. Ist ein Termin voll, landet die nächste Anmeldung auf der Warteliste (Position angezeigt). Storniert eine angemeldete Person vor Terminbeginn, rückt die erste Person der Warteliste automatisch nach und erhält eine E-Mail.
4. Nach dem Anmeldeschluss sind Storno und Umbuchung für Bewerber:innen gesperrt (UI und Backend), für die Verwaltung weiterhin möglich.
5. Die Verwaltung kann eine Person ohne Konto anmelden. Die Person erhält eine Einladung, setzt ihr Passwort und sieht nach dem Login ihre Anmeldung. Ein Registrierungsversuch mit derselben E-Mail sendet die Einladung erneut.
6. Reine Schnupperer erscheinen nicht in der Standardansicht von `/applicants`, aber mit dem Filter „nur Schnupperer“.
7. Bei `applicationOpen = false` zeigt `/home` den Hinweis, und `PATCH /api/applicant/:id` durch eine:n Bewerber:in liefert `403`. Die Verwaltung kann weiterhin bearbeiten.
8. Nur Admins sehen `/settings` und können `applicationOpen` umschalten und die Bewerbungsphase abschließen.
9. Nach „Bewerbungsphase abschließen“ gilt:
   - Es existieren keine `created`-Konten, Schnuppertermine oder Schnupper-Anmeldungen mehr.
   - Alle übrigen Bewerbungen enthalten keine Namen, Geburtsdaten, SVNR, Straßen, Telefonnummern oder E-Mails mehr; PLZ/Ort, Vorschule, Noten und Klassenwünsche sind erhalten.
   - `applicationOpen` ist `false`.
   - Ein zweiter Lauf ändert nichts.
10. Gleichzeitige Anmeldungen durch Bewerber:innen auf den letzten freien Platz führen zu höchstens `maxParticipants` Anmeldungen mit Status `registered`.
11. Die Verwaltung kann einen vollen Termin mit „Überbuchen“ fix belegen. Danach rückt erst wieder jemand von der Warteliste nach, wenn die Anzahl `registered` unter `maxParticipants` fällt.

## 10. Geklärte Detailfragen

1. **Geburtsland**: `countryOfBirth` bleibt bei der Anonymisierung erhalten, `placeOfBirth` wird gelöscht.
2. **Überbuchung**: Die Verwaltung darf volle Termine überbuchen (4.5).
3. **Datenschutztext**: Die Erweiterung wird intern mit Schulleitung bzw. Datenschutz abgestimmt. Die Umsetzung verwendet einen Platzhaltertext, bis der finale Wortlaut vorliegt.
