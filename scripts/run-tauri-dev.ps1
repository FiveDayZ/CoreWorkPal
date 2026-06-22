$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$env:COREPACK_HOME = Join-Path $repoRoot ".corepack"
$env:CARGO_HOME = Join-Path $repoRoot ".toolchains\cargo"
$env:RUSTUP_HOME = Join-Path $repoRoot ".toolchains\rustup"
$env:PATH = (Join-Path $repoRoot ".toolchains\cargo\bin") + ";" + $env:PATH

Set-Location $repoRoot
corepack pnpm tauri dev
