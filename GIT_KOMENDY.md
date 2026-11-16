# Ściąga komend Git — TwojeKorzenie

Wszystkie najważniejsze polecenia do wysyłania zmian na GitHuba i pracy na wielu urządzeniach.

---

## 1. Wysyłanie nowych / zmienionych plików na GitHuba (codzienna praca)
Uruchom w folderze projektu (`c:\Users\wpmed\Documents\twojekorzenie`):

```cmd
git status
git add .
git commit -m "Opis wprowadzonych zmian"
git push
```

> **Uwaga:** Plik `.env` jest automatycznie ignorowany przez `.gitignore` — nigdy nie trafi na GitHuba.

---

## 2. Pierwsza konfiguracja autora na nowym komputerze
Jeśli Git zgłosi błąd `Author identity unknown`, ustaw swój prawdziwy e-mail z konta GitHub:

```cmd
git config --global user.name "DawidDavit"
git config --global user.email "TWOJ_PRAWDZIWY_EMAIL_Z_GITHUBA"
```

---

## 3. Pobranie projektu na drugim komputerze
```cmd
git clone https://github.com/DawidDavit/TwojeKorzenieDEMO16.11.git
cd TwojeKorzenieDEMO16.11
npm install
```
Następnie utwórz ręcznie plik `.env` (z `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY` — klucz `Publishable` / `anon`).

---

## 4. Pobranie najnowszych zmian na komputerze, gdzie repo już jest
```cmd
git pull
```

---

## 5. Szybkie sprawdzenie stanu i historii
```cmd
git status
git log --oneline -n 5
```
