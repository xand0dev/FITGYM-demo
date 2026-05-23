# Швидкий redeploy Vercel-білда мобілки.
# Виконує: expo export -p web → flatten шрифтів/іконок → vercel --prod
#
# Запуск:  .\redeploy-web.ps1
# З правами bypass (якщо потрібно):
#          powershell -ExecutionPolicy Bypass -File .\redeploy-web.ps1
#
# Передумови:
#   - .env у корені має EXPO_PUBLIC_GEMINI_API_KEY
#   - vercel CLI залогінений (`vercel login`)
#   - dist/.vercel/project.json лінкований на fitgym-mobile-web

$ErrorActionPreference = 'Stop'
$proj = $PSScriptRoot
Set-Location $proj

Write-Host "==> [1/3] expo export -p web (Render API URL зашиваємо у бандл)" -ForegroundColor Cyan
$env:EXPO_PUBLIC_API_URL = "https://fitgym-backend-ivk9.onrender.com/api"
npx expo export -p web

if (-not (Test-Path "$proj\dist")) {
    Write-Host "[ERR] dist/ не з'явився після експорту" -ForegroundColor Red
    exit 1
}

Write-Host "==> [2/3] flatten шрифтів і PNG (обходимо Vercel-блок /node_modules/)" -ForegroundColor Cyan
Set-Location "$proj\dist"

# Прибрати залишки попередніх запусків
Remove-Item -Recurse -Force "assets\fonts","assets\img" -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path "assets\fonts" | Out-Null
New-Item -ItemType Directory -Force -Path "assets\img"   | Out-Null

# Копія всіх *.ttf -> assets/fonts/, *.png -> assets/img/
Get-ChildItem -Recurse -Path "assets" -Include "*.ttf" -File `
    | Where-Object { $_.FullName -notlike "*\assets\fonts\*" } `
    | ForEach-Object { Copy-Item $_.FullName "assets\fonts\$($_.Name)" -Force }
Get-ChildItem -Recurse -Path "assets" -Include "*.png" -File `
    | Where-Object { $_.FullName -notlike "*\assets\img\*" } `
    | ForEach-Object { Copy-Item $_.FullName "assets\img\$($_.Name)" -Force }

# Sed-патч JS-бандлів: довгі node_modules-шляхи -> короткі flat
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

# Видалити assets/node_modules — більше не потрібен
Remove-Item -Recurse -Force "assets\node_modules" -ErrorAction SilentlyContinue

$fonts = (Get-ChildItem "assets\fonts" -File).Count
$imgs  = (Get-ChildItem "assets\img"   -File).Count
Write-Host "    fonts: $fonts file(s), img: $imgs file(s)" -ForegroundColor Gray

Write-Host "==> [3/3] vercel --prod (production deploy)" -ForegroundColor Cyan
vercel --prod

Set-Location $proj
Write-Host "==> Готово. URL: https://fitgym-mobile-web.vercel.app" -ForegroundColor Green
