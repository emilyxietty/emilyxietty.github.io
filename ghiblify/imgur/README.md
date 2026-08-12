# Compatibility copies — safe to delete later

These 45 files are duplicates of images that now live under
`ghiblify/backgrounds/<film>/`. Nothing links here any more:
`background.json` points every one of them at its film folder.

They stay served only so that a URL stored by an older build of the
extension still resolves. Favourites and the blacklist are keyed by
exact URL, so a user running 2.5.0 or earlier may be holding
`…/ghiblify/imgur/<name>.webp` in `chrome.storage`.

Ghiblify migrates those stored URLs to the film-folder paths on load
(`URL_REMAP` in `src/storage/backgroundStorage.ts`). Once a release
carrying that migration has been out long enough for users to have
opened a new tab, this folder can be removed.
