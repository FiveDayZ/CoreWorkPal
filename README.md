# CoreWorkPal

Tauri 2 + React + TypeScript + Rust desktop workstation companion.

The app includes the CoreCat desktop pet, hardware-driven animation states, floating monitor bar, tray controls, local settings/storage, and workshop state handling. CoreCat animation assets live in `src/assets/pets/animation`, with runtime state mapping in `src/pet/corecat/animation`.

## Commands

```bash
pnpm install
pnpm tauri dev
pnpm typecheck
pnpm test:corecat
pnpm optimize:animations
pnpm build
cd src-tauri && cargo fmt --check
cd src-tauri && cargo test
```

`pnpm optimize:animations` performs lossless PNG recompression for the CoreCat
animation sprite sheets and verifies that decoded pixels stay unchanged before
writing optimized files.
