#Author: Elijah Cannon
#West Coast Code Consultants

Write-Host "Happy Friday! -WC3 IT :)"
Set-ExecutionPolicy -ExecutionPolicy Bypass

#Install CPU-Z
$software = "CPUID CPU-Z 1.96";
$installed = $null -ne (Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Where-Object { $_.DisplayName -eq $software })
If (-Not $installed) {
    Write-Host "Now installing '$software'.";
    Set-Location -Path C:\WC3Benchmark-main\Files\CPU-Z -PassThru
    Powershell.exe -ExecutionPolicy Bypass .\Deploy-CPU-Z.ps1 -DeploymentType "Install" -DeployMode "NonInteractive"
} else {
    Write-Host "'$software' is installed.";
}

Write-Host "Generating Reports..."

# Run CPU Benchmark
Set-Location -Path "C:\\Program Files\\CPUID\\CPU-Z"
./cpuz.exe -bench
Set-Location -Path C:\WC3Benchmark-main -PassThru

#Generate Disk Report
Invoke-Expression -Command:"wmic bios get SerialNumber > diskinfo.txt"
$disks = @()
(get-WmiObject win32_logicaldisk | Where-Object { $_.DriveType -eq 3 }) | ForEach-Object{
    $disk = New-Object PSObject -Property @{
        Name = $_.Name
        Capacity = [math]::Round($_.Size / 1073741824, 2)
        FreeSpace = [math]::Round($_.FreeSpace / 1073741824, 2)
        Used = [string][math]::Round(($_.Size - $_.FreeSpace) / $_.Size * 100, 1)+"%"
        Read = 0
        Write = 0
    }
    $letter = $disk.Name.Substring(0,1)
    "Disk $letter Speeds" | Out-File -FilePath .\diskinfo.txt -Append
    Invoke-Expression -Command:"winsat disk -drive $letter -seq -read > temp.txt"
    Select-String -Path .\temp.txt -Pattern 'MB/s' -SimpleMatch | Out-File -FilePath .\diskinfo.txt -Append
    Invoke-Expression -Command:"winsat disk -drive $letter -seq -write > temp.txt"
    Select-String -Path .\temp.txt -Pattern 'MB/s' -SimpleMatch | Out-File -FilePath .\diskinfo.txt -Append
    $disks += $disk
}
[System.Collections.ArrayList]$disk_read = @()
[System.Collections.ArrayList]$disk_write = @()
$path = 'C:\\WC3Benchmark-main\\diskinfo.txt'
[System.IO.File]::ReadLines($path) | ForEach-Object {
    if ($_ -clike "*Read*"){
        $speed = $_.Substring(0,$_.IndexOf("MB/s")).Trim()
        $speed = [double]$speed.substring($speed.IndexOf("Read")+4).Trim()
        [void]$disk_read.Add($speed)
    }
    if ($_ -clike "*Write*"){
        $speed = $_.substring(0,$_.IndexOf("MB/s")).Trim()
        $speed = [double]$speed.substring($speed.IndexOf("Write")+5).Trim()
        [void]$disk_write.Add($speed)
    }
    
}
$count = 0
ForEach ($disk in $disks){
    $disk.Read = $disk_read[$count]
    $disk.Write = $disk_write[$count]
    $count += 1;
}

$cpu_benchmark = 0
$ram_speed = 0

Write-Host "Reading Reports..."

#Read CPU Benchmark
$path = "C:\\Program Files\\CPUID\\CPU-Z\\" + $env:COMPUTERNAME + ".txt"
[string]$line = (Select-String -Path $path -Pattern "," -SimpleMatch)
$cpu_benchmark = [double]::Parse($line.substring($line.IndexOf(",")+1).replace('"',' ').trim());

#Get Data
$ram_size = (Get-WMIObject -class Win32_PhysicalMemory -ComputerName $env:COMPUTERNAME |
Measure-Object -Property capacity -Sum | ForEach-Object {[Math]::Round(($_.sum / 1GB),2)})
$ram = Get-WmiObject win32_physicalmemory | Select-Object Configuredclockspeed
foreach ($slot in $ram){
    if ($slot.Configuredclockspeed -gt $ram_speed){
        $ram_speed = $slot.Configuredclockspeed 
    }
}
$cpu_numCores = [int](Get-WmiObject -Class Win32_Processor -Property "NumberOfCores" | Select-Object "NumberOfCores").NumberOfCores
$cpu_name = [string](Get-WmiObject -Class Win32_Processor -Property "Name" | Select-Object "Name").Name
$cpu_maxClock = (Get-WmiObject -Class Win32_Processor | Select-Object MaxClockSpeed).MaxClockSpeed
$serial_number = (Get-WmiObject win32_bios | Select-Object SerialNumber).SerialNumber
$date = Get-Date -Format "MM/dd/yyyy HH:mm K"
$graphics = @((Get-WmiObject Win32_VideoController | Select-Object Name).Name)

# Transmit Data
Write-Host "Posting Data..."
Write-Host ""
Write-Host "$env:COMPUTERNAME"
Write-Host "Serial Number: $serial_number"
Write-Host "$date"
Write-Host ""
Write-Host "CPU Info-"
Write-Host "$cpu_name"
Write-Host "Cores: $cpu_numCores"
Write-Host "Core Clock Speed: $cpu_maxClock"
Write-Host "CPU-Z Benchmark: $cpu_benchmark"
Write-Host ""
Write-Host "RAM Info-"
Write-Host "Memory Size: $ram_size"
Write-Host "Clock Speed: $ram_speed"
Write-Host ""
Write-Host "GPUs-"
Write-Host $graphics
Write-Host ""
Write-Host "Disk Drives-"
Write-Host $disks
Write-Host ""

$diskData = @{}
for ($i=0; $i -lt $disks.Count; $i++){
    $list = @{"Capacity"=$disk[$i].Capacity;"Used"=$disk[$i].Used;"Read Speed"=$disk[$i].read;"Write Speed"=$disk[$i].write}
    $diskData.Add($disk[$i].Name, $list)
}

[System.Collections.ArrayList]$gpus = @()
foreach ($card in $graphics){
    [void]$gpus.Add($card)
}

$data = @{
    "Computer Name" = $env:COMPUTERNAME;
    "Serial Number" = $serial_number;
    "Timestamp" = $date;
    "CPU" = $cpu_name;
    "Cores" = $cpu_numCores;
    "Core Clock Speed" = $cpu_maxClock;
    "CPU-Z Benchmark" = $cpu_benchmark;
    "RAM Size" = $ram_size;
    "RAM Clock Speed" = $ram_speed;
    "Drives" = $diskData;
    "GPUs" = $gpus;
}

$data | ConvertTo-Json -Depth 10 | Out-File ".\data.json"

#Remove files we are done using
Invoke-Expression -Command:"del temp.txt"
Invoke-Expression -Command:"del diskinfo.txt"