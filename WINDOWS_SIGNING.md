# Windows Signing

CoreWorkPal release builds can sign Windows `.exe` and `.msi` bundles during the GitHub Actions release workflow.

## Required GitHub Secrets

Add these repository secrets in `FiveDayZ/CoreWorkPal`:

- `WINDOWS_CERTIFICATE`: Base64 encoded `.pfx` code signing certificate.
- `WINDOWS_CERTIFICATE_PASSWORD`: Export password for the `.pfx` certificate.
- `WINDOWS_SIGNING_TIMESTAMP_URL`: Optional timestamp server URL. If omitted, the workflow uses `http://timestamp.digicert.com`.

The release workflow fails if `WINDOWS_CERTIFICATE` or `WINDOWS_CERTIFICATE_PASSWORD` is missing. To intentionally produce an unsigned build for a temporary internal run, set `ALLOW_UNSIGNED_WINDOWS_BUILD=true` for the certificate import step.

## Convert a PFX to Base64

On Windows:

```powershell
certutil -encode certificate.pfx base64cert.txt
```

Copy the full contents of `base64cert.txt` into the `WINDOWS_CERTIFICATE` secret.

## Important

Self-signed certificates can prove that the file has not been modified, but they do not make Windows trust the publisher by default. To reduce SmartScreen warnings for public downloads, use a real code signing certificate from a trusted certificate authority. EV certificates generally gain SmartScreen reputation faster than OV certificates.
