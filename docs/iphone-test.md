# iPhone-Test – Fit & Einkauf

Checkliste für den ersten Test am echten iPhone. Jeden Punkt abhaken und unter **Ergebnis** kurz notieren, was passiert ist (bei Abweichung: was genau, und wenn möglich ein Bildschirmfoto). „Erwartung“ beschreibt, was die App tun sollte.

| | |
|---|---|
| Getestet am | |
| iOS-Version | |
| App-Stand (Commit oder Datum des letzten Pushs) | |

---

## 0. Installieren

- [ ] **Zum Home-Bildschirm hinzufügen**
  1. In **Safari** öffnen: <https://peppdoe.github.io/fit-einkauf/>
  2. Unten auf das **Teilen-Symbol** (Quadrat mit Pfeil nach oben) tippen.
  3. Nach unten scrollen → **„Zum Home-Bildschirm“** → Name „Fit & Einkauf“ lassen → **„Hinzufügen“**.
  4. Safari schließen und die App **über das neue Symbol am Home-Bildschirm** öffnen. Alle weiteren Tests nur so (nicht im Safari-Tab).

  **Erwartung:** Symbol mit Namen „Fit & Einkauf“ am Home-Bildschirm. Die App öffnet ohne Safari-Adressleiste, Startseite ist „Heute“.

  **Ergebnis:**

---

## 1. Ton am Ende der Pause

Vorbereitung: Training → „Training starten“ → einen Satz mit „Satz … fertig“ abschließen; die Pausen-Leiste läuft. Zum Abkürzen kann die Pause unter Mehr → Training kurz gestellt werden (danach wieder auf 90 s).

- [ ] **Lautlos-Schalter AUS** (normaler Ton), Bildschirm offen
  **Erwartung:** Am Ende der Pause ein kurzer Piep; die Leiste wechselt auf Grün und blinkt kurz.
  **Ergebnis:**

- [ ] **Lautlos-Schalter AN**, Bildschirm offen
  **Erwartung:** Piep trotzdem hörbar (die App meldet sich als Wiedergabe an). Falls nicht: Blinken der Leiste ist deutlich sichtbar.
  **Ergebnis:**

- [ ] **Bildschirm gesperrt** während der Pause (Seitentaste), nach Ablauf entsperren
  **Erwartung:** Ein Piep bei gesperrtem Bildschirm ist bei Web-Apps **nicht sicher** – iOS pausiert sie im Hintergrund. Nach dem Entsperren zeigt die Leiste sofort den richtigen Stand („vorbei“ bzw. die richtige Restzeit), nicht die Zeit vom Sperren.
  **Ergebnis (Piep ja/nein, Stand nach Entsperren richtig?):**

- [ ] **Musik im Hintergrund** (z. B. Musik-App läuft), dann Pause ablaufen lassen
  **Erwartung:** Piep hörbar. Notieren, was mit der Musik passiert: läuft weiter, wird kurz leiser oder **stoppt** (stoppt sie, ist das ein Fehler, den wir beheben).
  **Ergebnis:**

- [ ] **Blinken als Ersatz**
  **Erwartung:** Wenn kein Ton kommt, ist das Aufblinken der Pausen-Leiste aus 1–2 m (Handy am Boden) gut zu sehen. Bei Einstellungen → Bedienungshilfen → Bewegung → „Bewegung reduzieren“ AN: kein Blinken, Leiste bleibt grün umrandet.
  **Ergebnis:**

---

## 2. Bildschirm bleibt an (Wake Lock)

- [ ] Automatische Sperre auf z. B. 30 s stellen (Einstellungen → Anzeige & Helligkeit). Einheit starten und das Handy **ohne Berühren** 2–3 Minuten liegen lassen.
  **Erwartung:** Während einer laufenden Einheit geht der Bildschirm nicht aus. Nach „Einheit abschließen“ oder „Überspringen“ gilt wieder die normale automatische Sperre.
  **Ergebnis:**

---

## 3. Export und Import

- [ ] **Export:** Mehr → Daten → „Daten exportieren“ → im Teilen-Blatt **„In Dateien sichern“** → Ordner wählen → Sichern.
  **Erwartung:** Teilen-Blatt öffnet sich; eine JSON-Datei mit Datum im Namen liegt danach in der Dateien-App. „Letzte Sicherung“ unter Daten zeigt das heutige Datum; die Export-Erinnerung auf Heute verschwindet.
  **Ergebnis:**

- [ ] **Import derselben Datei:** vorher etwas ändern (z. B. ein Gewicht eintragen), dann Mehr → Daten → „Daten importieren“ → die eben gesicherte Datei wählen.
  **Erwartung:** Rückmeldung, dass importiert wurde; der Stand der Datei ist wieder da (die Änderung danach ist weg). Training-Verlauf, Wochenplan, Einkaufs-Haken, Gewicht und Einstellungen vollständig.
  **Ergebnis:**

---

## 4. Offline

- [ ] **Flugmodus an** (WLAN auch aus), App komplett schließen (vom unteren Rand nach oben wischen und App wegwischen), wieder öffnen, Training starten und einen Satz loggen.
  **Erwartung:** App startet normal, alle Bereiche funktionieren, Training lässt sich starten und loggen. Danach Flugmodus wieder aus.
  **Ergebnis:**

---

## 5. Update kommt an

- [x] Vorher Bescheid geben – dann wird eine kleine, sichtbare Änderung gepusht (z. B. ein Wort im Untertitel von „Mehr“). Danach App **einmal öffnen und schließen**, dann **ein zweites Mal öffnen**.
  **Erwartung:** Beim ersten Öffnen noch der alte Stand (er kommt sofort aus dem Speicher, die neue Version lädt im Hintergrund). Spätestens beim zweiten Öffnen ist die Änderung zu sehen.
  **Ergebnis (bei welchem Öffnen sichtbar?):** 15.10.2026, Markierung „· Update-Test 1“ im Untertitel von Mehr (Commit 7258c14): erst beim **dritten** Öffnen sichtbar (erwartet: zweites). Vermutete Ursache: GitHub Pages schickt `Cache-Control: max-age=600`; das Nachladen im Service Worker kann bis zu 10 Minuten die alte Datei aus dem Browser-Cache bekommen. Möglicher Fix: im Service Worker mit `cache: 'no-cache'` nachladen (fragt per ETag beim Server nach). Markierung danach zurückgenommen.

---

## 6. Dunkelmodus

- [ ] Im Kontrollzentrum (oben rechts herunterwischen) **Dunkelmodus** umschalten, während die App offen ist.
  **Erwartung:** Die App wechselt sofort mit. **Segment-Schalter** (Heute: Tag/Woche, Essen: Woche/Bibliothek, Einkauf: Nach Markt/Nach Rezept): das gewählte Segment ist heller als die Schiene. **„So geht's“-Blatt** (in einer laufenden Einheit die Figur antippen): hebt sich mit sichtbarer Oberkante und runden Ecken vom schwarzen Hintergrund ab. Statusleiste oben gut lesbar.
  **Ergebnis:**

---

## 7. Sicherer Bereich (Notch und Home-Balken)

- [ ] Alle fünf Tabs durchgehen, jeweils ganz nach oben und ganz nach unten scrollen; „So geht's“-Blatt und das Markt-Blatt im Einkauf (Zeile lange drücken) öffnen.
  **Erwartung:** Große Überschriften liegen nicht unter der Notch / Dynamic Island. Tab-Leiste, Pausen-Leiste und Blätter liegen über dem Home-Balken, nichts ist verdeckt. Während ein Blatt offen ist, ist die Tab-Leiste ausgeblendet. Der letzte Eintrag jeder Seite ist ganz zu sehen.
  **Ergebnis:**

---

## 8. Übungsfigur: Kopfabstand

- [ ] Einheit starten und die Figur oben rechts in der Übungskarte ansehen (am besten bei einer Klimmzug-Übung, Startpose).
  **Erwartung:** Der Kopf hat sichtbar etwas Luft zur Oberkante des Kästchens. Notieren, ob es zu knapp wirkt – dann bekommt der Ausschnitt 2–3 Einheiten mehr Rand oben.
  **Ergebnis (passt / zu knapp):**

---

## 9. Daten bleiben erhalten

- [ ] Mehr → Gewicht → einen Wert eintragen. App **komplett schließen** (App-Umschalter, wegwischen), wieder öffnen.
  **Erwartung:** Der Wert steht noch in der Liste (und auf Heute unter „Gewicht“).
  **Ergebnis:**

---

## Sonstiges

Alles, was auffällt (Darstellung der Schrift, Tippflächen zu klein, Texte, Abläufe):

-
