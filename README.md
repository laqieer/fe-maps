# GBA Fire Emblem Data Maps

[![Build and deploy GitHub Pages](https://github.com/laqieer/fe-maps/actions/workflows/build-deploy-pages.yml/badge.svg)](https://github.com/laqieer/fe-maps/actions/workflows/build-deploy-pages.yml)

Source code for app at laqieer.github.io/fe-maps

*Inspired by [GBA Metroid Data Maps](https://github.com/biosp4rk/maps)*

## Powered by

These maps are built from ROM/RAM labels extracted by the companion
[`fe-info`](https://github.com/laqieer/fe-info) tooling with `readelf` and `nm -l`:

- [FE6: The Binding Blade](https://github.com/FireEmblemUniverse/fireemblem6j) - provides FE6 section and symbol data.
- [FE8U: The Sacred Stones](https://github.com/laqieer/fireemblem8u) - provides FE8U section and symbol data.
- [FE8J: 聖魔の光石 / Seima no Kouseki](https://github.com/laqieer/fireemblem8j) - provides FE8J section and symbol data.

## Filter Options
- Filters are case insensitive
- Separate search terms with spaces
- Search for addresses by putting `=` before a hex address
- Search for address ranges by putting `>`, `<`, `>=`, or `<=` before a hex address
- Search for entries near an address by putting `~` before a hex address
- Search for phrases by putting `"` around the phrase
- Search for regex patterns by putting `/` around the pattern
- Put `-` before a term, phrase, or pattern to exclude it from the results
- Clear a filter by pressing `esc`

### Examples
- `=8000000`
  - Entry with the address 0x8000000
- `<=8A8D3C`
  - Entries with an address of 0x8A8D3C or less
- `>=842D74 <843788`
  - Entries with an address between 0x842D74 and 0x843788
- `~843788`
  - Entry at 0x843788 (if an entry matches) and the entries before and after
- `battle animation`
  - Entries that contain both "battle" and "animation"
- `battle -animation`
  - Entries that contain "battle" but not "animation"
- `"sound effect"`
  - Entries with the exact phrase "sound effect"
- `/items?/`
  - Entries that contain "item" or "items"

## Setup

Install dependencies:

```bash
npm i
```

## Build

```bash
npm run build
```

## Testing

Tests can be run with:

```bash
npm test
```

## Dev Server

To run the dev server and open the project in a new browser tab:

```bash
npm run serve
```
