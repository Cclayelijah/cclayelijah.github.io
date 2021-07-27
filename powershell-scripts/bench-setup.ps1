Set-ExecutionPolicy -ExecutionPolicy Bypass
$File = "C:\WC3Benchmark.zip"
New-Item $File -ItemType File -Force
Invoke-WebRequest -Uri "https://codeload.github.com/Cclayelijah/WC3Benchmark/zip/refs/heads/main?token=AC6UHFKNM6ZKC5B7DLDGDRLA7MIZS" -Headers @{"Authorization"="token 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"} -UseBasicParsing -OutFile "C:\WC3Benchmark.zip"
Expand-Archive -Path $File -DestinationPath "C:\" -Force
Remove-Item -Path $File -Force
Register-ScheduledTask -xml (Get-Content 'C:\WC3Benchmark-main\Files\WC3BenchmarkTask.xml' | Out-String) -TaskName "WC3 Benchmark" -TaskPath "\" -User SYSTEM -Force
"C:\WC3Benchmark-main\run-benchmark.ps1" | Invoke-Expression