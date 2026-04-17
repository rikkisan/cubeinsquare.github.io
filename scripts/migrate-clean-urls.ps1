$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding($false)
$gitExe = 'C:\Users\lilov\AppData\Local\GitHubDesktop\app-3.5.8\resources\app\git\mingw64\bin\git.exe'
$env:GIT_EXEC_PATH = 'C:\Users\lilov\AppData\Local\GitHubDesktop\app-3.5.8\resources\app\git\mingw64\bin'

function Read-Utf8([string]$path) {
    return [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
}

function Read-FromHead([string]$sitePath) {
    $normalized = $sitePath.Replace('\', '/')
    if (-not (Test-Path $gitExe)) {
        return $null
    }

    $lines = & $gitExe show "HEAD:$normalized" 2>$null
    if ($LASTEXITCODE -ne 0) {
        return $null
    }

    return ($lines -join "`n")
}

function Write-Utf8([string]$path, [string]$content) {
    $dir = Split-Path -Parent $path
    if ($dir -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    [System.IO.File]::WriteAllText($path, $content, $utf8)
}

function Get-LocaleFromSitePath([string]$sitePath) {
    $normalized = $sitePath.Replace('\', '/')
    if ($normalized -match '^(ru|fr|de|en)/') {
        return $Matches[1]
    }
    return 'en'
}

function Get-LangAttribute([string]$sitePath) {
    $locale = Get-LocaleFromSitePath $sitePath
    switch ($locale) {
        'ru' { return 'ru' }
        'fr' { return 'fr' }
        'de' { return 'de' }
        default { return 'en' }
    }
}

function Get-AbsoluteUrl([string]$cleanPath) {
    if ($cleanPath -eq '/') {
        return 'https://cubeinsquare.com/'
    }
    return "https://cubeinsquare.com$cleanPath"
}

function Resolve-SiteReference([string]$baseSitePath, [string]$value) {
    $baseUrl = "https://cubeinsquare.com/$($baseSitePath.Replace('\', '/'))"
    $resolved = [System.Uri]::new([System.Uri]::new($baseUrl), $value)
    return @{
        Path = $resolved.AbsolutePath.TrimStart('/')
        Suffix = "$($resolved.Query)$($resolved.Fragment)"
    }
}

function New-RedirectStub([string]$targetPath, [string]$lang) {
    $absolute = Get-AbsoluteUrl $targetPath
    return @"
<!DOCTYPE html>
<html lang="$lang">
<head>
    <meta charset="UTF-8">
    <meta name="robots" content="noindex, follow">
    <meta http-equiv="refresh" content="0; url=$targetPath">
    <link rel="canonical" href="$absolute">
    <script>location.replace('$targetPath' + location.search + location.hash);</script>
    <title>Redirecting...</title>
</head>
<body>
    <p>This page has moved. <a href="$targetPath">Continue</a>.</p>
</body>
</html>
"@
}

$map = [ordered]@{}

function Add-Route([string]$oldPath, [string]$newPath) {
    $map[$oldPath.Replace('\', '/')] = $newPath
}

$rootSlugs = @(
    'about',
    'custom-potions',
    'custom-villager-trades',
    'privacy-policy',
    'resource-pack-generator',
    'skin-editor',
    'tool-coming-soon',
    'tools',
    'wiki',
    'wiki-custom-model-data',
    'wiki-custom-potions',
    'wiki-custom-villager-trades',
    'wiki-resource-pack-generator',
    'wiki-skin-editor',
    'texture-painter',
    'wiki-texture-painter'
)

$localizedSlugs = @(
    'about',
    'custom-potions',
    'custom-villager-trades',
    'privacy-policy',
    'resource-pack-generator',
    'tool-coming-soon',
    'tools',
    'wiki',
    'wiki-custom-model-data',
    'wiki-custom-potions',
    'wiki-custom-villager-trades',
    'wiki-resource-pack-generator'
)

Add-Route 'index.html' '/'
Add-Route 'home.html' '/'
Add-Route 'wiki-universal-pack-generator.html' '/wiki-resource-pack-generator/'

foreach ($slug in $rootSlugs) {
    Add-Route "$slug.html" "/$slug/"
}

foreach ($locale in @('ru', 'fr', 'de')) {
    Add-Route "$locale/index.html" "/$locale/"
    Add-Route "$locale/home.html" "/$locale/"
    Add-Route "$locale/wiki-universal-pack-generator.html" "/$locale/wiki-resource-pack-generator/"
    foreach ($slug in $localizedSlugs) {
        Add-Route "$locale/$slug.html" "/$locale/$slug/"
    }
}

foreach ($slug in $rootSlugs) {
    Add-Route "en/$slug.html" "/$slug/"
}
Add-Route 'en/index.html' '/'
Add-Route 'en/home.html' '/'
Add-Route 'en/wiki-universal-pack-generator.html' '/wiki-resource-pack-generator/'

$sortedKeys = $map.Keys | Sort-Object { $_.Length } -Descending

function Transform-FullUrls([string]$text) {
    foreach ($oldPath in $sortedKeys) {
        $oldUrl = "https://cubeinsquare.com/$oldPath"
        $newUrl = Get-AbsoluteUrl $map[$oldPath]
        $pattern = [regex]::Escape($oldUrl) + '(?<suffix>(?:\?[^"''\s<]*)?(?:#[^"''\s<]*)?)'
        $text = [System.Text.RegularExpressions.Regex]::Replace(
            $text,
            $pattern,
            {
                param($match)
                return $newUrl + $match.Groups['suffix'].Value
            }
        )
    }
    return $text
}

function Rewrite-AttributeValue([string]$baseSitePath, [string]$value) {
    if ([string]::IsNullOrWhiteSpace($value)) { return $value }
    if ($value.StartsWith('http://') -or $value.StartsWith('https://') -or $value.StartsWith('#') -or $value.StartsWith('mailto:') -or $value.StartsWith('tel:') -or $value.StartsWith('data:') -or $value.StartsWith('javascript:')) {
        return $value
    }

    $resolved = Resolve-SiteReference $baseSitePath $value
    $normalized = $resolved.Path
    $suffix = $resolved.Suffix
    if ($map.Contains($normalized)) {
        return $map[$normalized] + $suffix
    }

    if ($normalized) {
        return "/$normalized$suffix"
    }

    return $value
}

function Transform-Html([string]$sitePath, [string]$text) {
    $text = Transform-FullUrls $text

    $text = [System.Text.RegularExpressions.Regex]::Replace(
        $text,
        '(?<prefix>\b(?:href|src|action)=["''])(?<value>[^"'']+)(?<suffix>["''])',
        {
            param($match)
            $rewritten = Rewrite-AttributeValue $sitePath $match.Groups['value'].Value
            return $match.Groups['prefix'].Value + $rewritten + $match.Groups['suffix'].Value
        }
    )

    $text = [System.Text.RegularExpressions.Regex]::Replace(
        $text,
        '(?<prefix>\bcontent=["''][^"'']*url=)(?<value>[^"'']+)(?<suffix>["''])',
        {
            param($match)
            $rewritten = Rewrite-AttributeValue $sitePath $match.Groups['value'].Value
            return $match.Groups['prefix'].Value + $rewritten + $match.Groups['suffix'].Value
        }
    )

    return $text
}

$activeRoots = @('index.html', 'ru/index.html', 'fr/index.html', 'de/index.html')
$movedRoots = @(
    'about.html',
    'custom-potions.html',
    'custom-villager-trades.html',
    'privacy-policy.html',
    'resource-pack-generator.html',
    'skin-editor.html',
    'tool-coming-soon.html',
    'tools.html',
    'wiki.html',
    'wiki-custom-model-data.html',
    'wiki-custom-potions.html',
    'wiki-custom-villager-trades.html',
    'wiki-resource-pack-generator.html',
    'wiki-skin-editor.html'
)

$movedLocalized = @(
    'ru/about.html',
    'ru/custom-potions.html',
    'ru/custom-villager-trades.html',
    'ru/privacy-policy.html',
    'ru/resource-pack-generator.html',
    'ru/tool-coming-soon.html',
    'ru/tools.html',
    'ru/wiki.html',
    'ru/wiki-custom-model-data.html',
    'ru/wiki-custom-potions.html',
    'ru/wiki-custom-villager-trades.html',
    'ru/wiki-resource-pack-generator.html',
    'fr/about.html',
    'fr/custom-potions.html',
    'fr/custom-villager-trades.html',
    'fr/privacy-policy.html',
    'fr/resource-pack-generator.html',
    'fr/tool-coming-soon.html',
    'fr/tools.html',
    'fr/wiki.html',
    'fr/wiki-custom-model-data.html',
    'fr/wiki-custom-potions.html',
    'fr/wiki-custom-villager-trades.html',
    'fr/wiki-resource-pack-generator.html',
    'de/about.html',
    'de/custom-potions.html',
    'de/custom-villager-trades.html',
    'de/privacy-policy.html',
    'de/resource-pack-generator.html',
    'de/tool-coming-soon.html',
    'de/tools.html',
    'de/wiki.html',
    'de/wiki-custom-model-data.html',
    'de/wiki-custom-potions.html',
    'de/wiki-custom-villager-trades.html',
    'de/wiki-resource-pack-generator.html'
)

foreach ($sitePath in $activeRoots) {
    $fullPath = Join-Path $root $sitePath
    $content = Read-FromHead $sitePath
    if ($null -eq $content) {
        $content = Read-Utf8 $fullPath
    }
    Write-Utf8 $fullPath (Transform-Html $sitePath $content)
}

foreach ($sitePath in $movedRoots + $movedLocalized) {
    $fullPath = Join-Path $root $sitePath
    $content = Read-FromHead $sitePath
    if ($null -eq $content) {
        $content = Read-Utf8 $fullPath
    }
    $transformed = Transform-Html $sitePath $content
    $slug = [System.IO.Path]::GetFileNameWithoutExtension($sitePath)
    $dir = Split-Path -Parent $sitePath
    $routeDir = if ($dir) { Join-Path $root (Join-Path $dir $slug) } else { Join-Path $root $slug }
    Write-Utf8 (Join-Path $routeDir 'index.html') $transformed

    $cleanPath = $map[$sitePath.Replace('\', '/')]
    Write-Utf8 $fullPath (New-RedirectStub $cleanPath (Get-LangAttribute $sitePath))
}

foreach ($sitePath in @(
    'home.html',
    'wiki-universal-pack-generator.html',
    'ru/home.html',
    'ru/wiki-universal-pack-generator.html',
    'fr/home.html',
    'de/home.html',
    'en/index.html',
    'en/home.html',
    'en/about.html',
    'en/custom-potions.html',
    'en/custom-villager-trades.html',
    'en/privacy-policy.html',
    'en/resource-pack-generator.html',
    'en/tool-coming-soon.html',
    'en/tools.html',
    'en/wiki.html',
    'en/wiki-custom-model-data.html',
    'en/wiki-custom-potions.html',
    'en/wiki-custom-villager-trades.html',
    'en/wiki-resource-pack-generator.html',
    'en/wiki-universal-pack-generator.html'
)) {
    $fullPath = Join-Path $root $sitePath
    if (-not (Test-Path $fullPath)) { continue }
    $cleanPath = $map[$sitePath.Replace('\', '/')]
    Write-Utf8 $fullPath (New-RedirectStub $cleanPath (Get-LangAttribute $sitePath))
}

$sitemapPath = Join-Path $root 'sitemap.xml'
$sitemap = Read-Utf8 $sitemapPath
Write-Utf8 $sitemapPath (Transform-FullUrls $sitemap)

$payloadRoot = Join-Path $root '.drip\queue\2026-04-19-texture-painter-release\payload'
if (Test-Path $payloadRoot) {
    foreach ($sitePath in @('tools.html', 'wiki.html', 'texture-painter.html', 'wiki-texture-painter.html')) {
        $fullPath = Join-Path $payloadRoot $sitePath
        $content = Read-FromHead ".drip/queue/2026-04-19-texture-painter-release/payload/$sitePath"
        if ($null -eq $content) {
            $content = Read-Utf8 $fullPath
        }
        $transformed = Transform-Html $sitePath $content
        $slug = [System.IO.Path]::GetFileNameWithoutExtension($sitePath)
        $routeDir = Join-Path $payloadRoot $slug
        Write-Utf8 (Join-Path $routeDir 'index.html') $transformed
        $cleanPath = $map[$sitePath.Replace('\', '/')]
        Write-Utf8 $fullPath (New-RedirectStub $cleanPath 'en')
    }

    $payloadSitemapPath = Join-Path $payloadRoot 'sitemap.xml'
    $payloadSitemap = Read-Utf8 $payloadSitemapPath
    Write-Utf8 $payloadSitemapPath (Transform-FullUrls $payloadSitemap)
}
