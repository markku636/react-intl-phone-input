# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/) and the project uses
[Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-06-20

### Added

- Initial release. `PhoneNumberInput` React component extracted from an internal
  admin app, with **no Ant Design dependency** (vanilla React + themeable CSS).
- All phone parsing / validation / formatting powered by `google-libphonenumber`
  (declared as a `peerDependency`).
- Configurable, **required** `validationLevel` prop: `strict`, `mobile-strict`,
  `loose`.
- Framework-agnostic core exported from `react-intl-phone-number/core`
  (`validatePhoneNumber`, `getPhoneNumberError`, `toE164`, `getPhoneTypeHints`, …).
- i18n via a `messages` object (English defaults) and/or a `t(key, vars)` function.
- Searchable country dropdown with flags (`country-flag-icons`) and calling-code
  search; modern, CSS-variable-driven, `classNames`-overridable styling.
