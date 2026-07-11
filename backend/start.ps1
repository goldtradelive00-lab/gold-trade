$scriptDir = if ($PSCommandPath) { Split-Path -Parent $PSCommandPath } `
             elseif ($PSScriptRoot) { $PSScriptRoot } `
             else { (Get-Location).Path }

Set-Location $scriptDir

# Kill anything on port 8080
$conn = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($conn) {
    Write-Host "Stopping process on port 8080 (PID $($conn.OwningProcess))..." -ForegroundColor Yellow
    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep 1
}

# Load .env
$envFile = Join-Path $scriptDir '.env'
if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -notmatch '^#' -and $_ -ne '' } | ForEach-Object {
        $kv = $_ -split '=', 2
        if ($kv.Count -eq 2) {
            [System.Environment]::SetEnvironmentVariable($kv[0].Trim(), $kv[1].Trim())
        }
    }
} else {
    Write-Host "No .env found in $scriptDir - copy .env.example to .env and fill in values." -ForegroundColor Red
}

Write-Host "Starting Spring Boot backend on http://localhost:8080`n" -ForegroundColor Cyan
& "$scriptDir\mvnw.cmd" spring-boot:run
