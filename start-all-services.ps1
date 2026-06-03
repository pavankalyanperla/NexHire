# NexHire — Start All Services
# Opens a separate PowerShell window for each service.
# Run from the project root: .\start-all-services.ps1

$Root = $PSScriptRoot

function Start-Service {
    param(
        [string]$Title,
        [string]$WorkDir,
        [string]$Command,
        [string]$Color = "DarkBlue"
    )

    $cmd = @"
`$host.ui.RawUI.WindowTitle = '$Title'
`$host.ui.RawUI.BackgroundColor = '$Color'
Clear-Host
Write-Host '================================================' -ForegroundColor Cyan
Write-Host '  $Title' -ForegroundColor White
Write-Host '================================================' -ForegroundColor Cyan
Write-Host ''
Set-Location '$WorkDir'
$Command
"@

    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd
}

# ── Kill stale dotnet processes ────────────────────────────────────────────────
Write-Host "Stopping any running dotnet processes..." -ForegroundColor Yellow
Stop-Process -Name "dotnet" -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

Write-Host ""
Write-Host "Starting all NexHire services..." -ForegroundColor Green
Write-Host ""

# ── .NET Backend Services ──────────────────────────────────────────────────────
Start-Service `
    -Title   "IdentityService  :5100" `
    -WorkDir "$Root\backend\IdentityService\IdentityService.API" `
    -Command "dotnet run" `
    -Color   "DarkBlue"

Start-Sleep -Milliseconds 300

Start-Service `
    -Title   "HRMSService  :5200" `
    -WorkDir "$Root\backend\HRMSService\HRMSService.API" `
    -Command "dotnet run" `
    -Color   "DarkGreen"

Start-Sleep -Milliseconds 300

Start-Service `
    -Title   "RecruitmentService  :5300" `
    -WorkDir "$Root\backend\RecruitmentService\RecruitmentService.API" `
    -Command "dotnet run" `
    -Color   "DarkMagenta"

Start-Sleep -Milliseconds 300

Start-Service `
    -Title   "OcelotGateway  :5000" `
    -WorkDir "$Root\gateway\OcelotGateway" `
    -Command "dotnet run" `
    -Color   "DarkRed"

Start-Sleep -Milliseconds 300

# ── Python AI Services ─────────────────────────────────────────────────────────
Start-Service `
    -Title   "ResumeAI  :8001" `
    -WorkDir "$Root\ai-services\ResumeAI" `
    -Command "uvicorn main:app --host 0.0.0.0 --port 8001 --reload" `
    -Color   "DarkCyan"

Start-Sleep -Milliseconds 300

Start-Service `
    -Title   "InterviewAI  :8002" `
    -WorkDir "$Root\ai-services\InterviewAI" `
    -Command "uvicorn main:app --host 0.0.0.0 --port 8002 --reload" `
    -Color   "DarkYellow"

Start-Sleep -Milliseconds 300

# ── Angular Frontend ───────────────────────────────────────────────────────────
Start-Service `
    -Title   "Angular Frontend  :4200" `
    -WorkDir "$Root\frontend\nexhire-angular" `
    -Command "ng serve" `
    -Color   "Black"

# ── Summary ────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "All 7 service windows launched:" -ForegroundColor Green
Write-Host "  IdentityService     -> http://localhost:5100/swagger" -ForegroundColor Cyan
Write-Host "  HRMSService         -> http://localhost:5200/swagger" -ForegroundColor Green
Write-Host "  RecruitmentService  -> http://localhost:5300/swagger" -ForegroundColor Magenta
Write-Host "  OcelotGateway       -> http://localhost:5000" -ForegroundColor Red
Write-Host "  ResumeAI            -> http://localhost:8001/docs" -ForegroundColor Cyan
Write-Host "  InterviewAI         -> http://localhost:8002/docs" -ForegroundColor Yellow
Write-Host "  Angular             -> http://localhost:4200" -ForegroundColor White
Write-Host ""
Write-Host "Close any window to stop that service." -ForegroundColor Gray
