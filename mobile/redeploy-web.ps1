# Fast redeploy of Vercel mobile web build.
# Steps:
#   1) expo export -p web      (bakes Render API URL into JS bundle)
#   2) flatten fonts and PNGs  (works around Vercel /node_modules/ block)
#   3) vercel --prod           (deploy to fitgym-mobile-web)
#
# Usage:  .\redeploy-web.ps1
# Or:     powershell -ExecutionPolicy Bypass -File .\redeploy-web.ps1
#
# Requirements:
#   - .env contains EXPO_PUBLIC_GEMINI_API_KEY
#   - vercel CLI is logged in (vercel login)
#   - dist/.vercel/project.json links to fitgym-mobile-web

$ErrorActionPreference = 'Stop'
$proj = $PSScriptRoot
Set-Location $proj

Write-Host "==> [1/3] expo export -p web (bake Render API URL into bundle)" -ForegroundColor Cyan
$env:EXPO_PUBLIC_API_URL = "https://fitgym-backend-ivk9.onrender.com/api"
npx expo export -p web

if (-not (Test-Path "$proj\dist")) {
    Write-Host "[ERR] dist/ missing after export" -ForegroundColor Red
    exit 1
}

Write-Host "==> [2/3] flatten font and PNG paths (Vercel blocks /node_modules/)" -ForegroundColor Cyan
Set-Location "$proj\dist"

# Remove previous run artifacts
Remove-Item -Recurse -Force "assets\fonts","assets\img" -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path "assets\fonts" | Out-Null
New-Item -ItemType Directory -Force -Path "assets\img"   | Out-Null

# Copy all *.ttf -> assets/fonts/, *.png -> assets/img/
Get-ChildItem -Recurse -Path "assets" -Include "*.ttf" -File `
    | Where-Object { $_.FullName -notlike "*\assets\fonts\*" } `
    | ForEach-Object { Copy-Item $_.FullName "assets\fonts\$($_.Name)" -Force }
Get-ChildItem -Recurse -Path "assets" -Include "*.png" -File `
    | Where-Object { $_.FullName -notlike "*\assets\img\*" } `
    | ForEach-Object { Copy-Item $_.FullName "assets\img\$($_.Name)" -Force }

# Patch JS bundles: long node_modules paths -> short flat paths
Get-ChildItem "_expo\static\js\web\*.js" | ForEach-Object {
    $c = [IO.File]::ReadAllText($_.FullName)
    $c = $c.Replace(
        'node_modules/expo/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/',
        'fonts/')
    $c = $c.Replace(
        'node_modules/@react-navigation/elements/lib/module/assets/',
        'img/')
    [IO.File]::WriteAllText($_.FullName, $c)
}

# Drop the leftover assets/node_modules tree
Remove-Item -Recurse -Force "assets\node_modules" -ErrorAction SilentlyContinue

$fonts = (Get-ChildItem "assets\fonts" -File).Count
$imgs  = (Get-ChildItem "assets\img"   -File).Count
Write-Host "    fonts: $fonts file(s), img: $imgs file(s)" -ForegroundColor Gray

Write-Host "==> [3/4] inject mobile-frame CSS into index.html (desktop view)" -ForegroundColor Cyan
$indexPath = "$proj\dist\index.html"
$indexHtml = [IO.File]::ReadAllText($indexPath)
$oldStyle  = "    <style id=`"expo-reset`">`r`n      /* These styles make the body full-height */`r`n      html,`r`n      body {`r`n        height: 100%;`r`n      }`r`n      /* These styles disable body scrolling if you are using <ScrollView> */`r`n      body {`r`n        overflow: hidden;`r`n      }`r`n      /* These styles make the root element full-height */`r`n      #root {`r`n        display: flex;`r`n        height: 100%;`r`n        flex: 1;`r`n      }`r`n    </style>"
$newStyle = @'
    <style id="expo-reset">
      html, body { height: 100%; }
      body { overflow: hidden; margin: 0; background: #000; }
      #root { display: flex; height: 100%; flex: 1; }
      /* Mobile frame on wide screens (desktop). On phones — full-screen. */
      @media (min-width: 768px) {
        body {
          display: flex; align-items: center; justify-content: center;
          background: radial-gradient(circle at center, #1a1a1a 0%, #000 100%);
        }
        #root {
          width: 412px; max-width: 100vw;
          height: 896px; max-height: 100vh;
          flex: 0 0 auto;
          border-radius: 32px; overflow: hidden;
          box-shadow:
            0 0 0 8px #111,
            0 20px 60px rgba(255, 0, 0, 0.25),
            0 0 80px rgba(0, 0, 0, 0.6);
        }
      }
    </style>
'@
if ($indexHtml.Contains($oldStyle)) {
    $indexHtml = $indexHtml.Replace($oldStyle, $newStyle.TrimEnd())
    [IO.File]::WriteAllText($indexPath, $indexHtml)
    Write-Host "    mobile-frame CSS injected" -ForegroundColor Gray
} elseif ($indexHtml.Contains('min-width: 768px')) {
    Write-Host "    mobile-frame CSS already present, skip" -ForegroundColor Gray
} else {
    Write-Host "    [WARN] expo-reset block not found in expected form; CSS NOT injected" -ForegroundColor Yellow
}

Write-Host "==> [4/4] vercel --prod (production deploy)" -ForegroundColor Cyan
# Restore project link to fitgym-mobile-web (expo export wipes dist/ each run,
# so .vercel/project.json is lost — without this Vercel creates a brand-new
# project named "dist" instead of updating the canonical one).
New-Item -ItemType Directory -Force -Path ".vercel" | Out-Null
$linkJson = '{"projectId":"prj_rrnGOnO5cKIltKP6oceycSSS7MPp","orgId":"team_8L8ohSKd70EZJqQeaDCoBAFU","projectName":"fitgym-mobile-web"}'
[IO.File]::WriteAllText("$proj\dist\.vercel\project.json", $linkJson)

vercel --prod

Set-Location $proj
Write-Host "==> Done. URL: https://fitgym-mobile-web.vercel.app" -ForegroundColor Green
