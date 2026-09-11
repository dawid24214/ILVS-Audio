# ILVS Audio — React + Admin Panel

Projekt sklepu ILVS Audio przebudowany do React/Vite bez Tailwinda.

## Dostępne trasy

- `/` — strona główna sklepu
- `/kategorie` — kategorie produktów
- `/kasa` — checkout
- `/informacje` — informacje
- `/admin` — panel administratora

Panel administratora jest obecnie tylko warstwą UI. Nie ma jeszcze logowania, backendu, bazy danych ani edycji produktów.

## Uruchomienie

```bash
npm install
npm run dev
```

Po uruchomieniu Vite otwórz adres wyświetlony w terminalu. Panel administratora znajdziesz pod `/admin`.

## Panel administratora
Panel dostępny pod `/admin` posiada osobne widoki:
- `/admin/produkty`
- `/admin/zamowienia`
- `/admin/klienci`
- `/admin/kategorie`
- `/admin/ustawienia`

Widoki są obecnie warstwą UI z przykładowymi danymi, bez backendu.
