# React + Vite

## Talent Show admin data

The `/admin/talent-show` page reads application records from the GET endpoint
configured by `VITE_TALENT_SHOW_API`. The endpoint should return either an
array of records or an object containing a `data` or `applications` array.
Without this setting the page intentionally shows no sample records.

The endpoint should return records with an `id`, child name, contact number,
parent name, age, city, and optionally an active/status field. The page accepts
common snake_case and camelCase field names. Add, edit, and activation actions
remain disabled until corresponding database write APIs are available.

## Creative Ideas admin data

The `/admin/ideas` page loads records only from the GET endpoint configured by
`VITE_CREATIVE_IDEAS_API`; it never includes sample ideas. The endpoint should
accept `status`, `search`, `page`, and `per_page` query parameters and return
either an array, an object containing an `ideas` array, or a paginated object
containing a `data` array and `current_page`, `last_page`, and `total` metadata.
Each idea should include its database `id`, name, reel idea, review status, and
an active/inactive field when supported. Add New links to the existing
submission form. Editing, deactivation, and exports remain disabled until the
backend provides those operations.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
