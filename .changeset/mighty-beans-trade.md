---
'json-react-layouts': major
'json-react-layouts-data-loader': major
---

## Breaking Changes

### `json-react-layouts`

-   `RendererMiddleware` does not depend on `ComponentProps` anymore and will contain a `{ layoutType: string }` value instead to represent the component/composition type.

### `json-react-layouts-data-loader`

-   `middleware` converted to `getMiddleware(type: 'composition' | 'component')` method to support composition middleware.
