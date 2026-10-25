# origin_signature: MrLiouWord
#
# 在 DL580 上執行 MRL 世界模型的驗收。
# 目錄佈局與倉庫相同：<root>\mrl_world_model\ 與 <root>\core\particle_dict.json。
# 例：D:\mrl\workspace\MRL_WorldModel_v1\mrl_world_model\run_dl580.ps1
#
# 只讀取本目錄與 core\particle_dict.json；只新增一個帶時間戳的 run_* 目錄，
# 不覆寫、不刪除任何既有檔案，不連網。

$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$root = Split-Path -Parent $here

$node = 'D:\MrlToolchain\node\node.exe'
if (-not (Test-Path $node)) { $node = 'node' }

Write-Output "node: $(& $node --version)"
Write-Output "root: $root"

# 檔案雜湊：與交付清單 SHA256SUMS.txt 逐檔比對
$sums = Join-Path $root 'SHA256SUMS.txt'
if (Test-Path $sums) {
    $bad = 0
    foreach ($line in Get-Content $sums) {
        if ($line -notmatch '^([0-9a-f]{64})  (.+)$') { continue }
        $want = $Matches[1]; $rel = $Matches[2]
        $path = Join-Path $root ($rel -replace '/', '\')
        $got = (Get-FileHash -Algorithm SHA256 -LiteralPath $path).Hash.ToLower()
        if ($got -ne $want) { Write-Output "SHA256 MISMATCH $rel"; $bad++ }
    }
    Write-Output "sha256_mismatch: $bad"
    if ($bad -ne 0) { exit 1 }
}

& $node --test (Join-Path $here 'tests\world_model.test.mjs')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$out = Join-Path $root ('run_' + (Get-Date -Format 'yyyyMMddTHHmmss'))
& $node (Join-Path $here 'cli.mjs') --out $out
$code = $LASTEXITCODE
Write-Output "report: $out\report.json"
exit $code
