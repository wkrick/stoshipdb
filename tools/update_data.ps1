# PowerShell script to pull data in CSV format from Google Sheets page and massage into JSON data used by the app

# data source: https://docs.google.com/spreadsheets/d/1-5Nmp_vycD2VpLbuqWnnQL1Lvx-nPy-cGYLPIckGRLk/edit?usp=sharing
# created by Reddit user u/Fleffle

$client = new-object System.Net.WebClient
$today = (Get-Date).tostring("yyyy-MM-dd")
$url = 'https://docs.google.com/spreadsheets/d/1-5Nmp_vycD2VpLbuqWnnQL1Lvx-nPy-cGYLPIckGRLk/export?format=csv&id=1-5Nmp_vycD2VpLbuqWnnQL1Lvx-nPy-cGYLPIckGRLk&gid=0'
$csvname = "Sortable_Filterable T6 Ship List - Ships_$today.csv"
$client.DownloadFile($url,"$PSScriptRoot/$csvname")

# write the csv data to a temp file, skipping the first two lines
Get-ChildItem "$PSScriptRoot/$csvname" | ForEach-Object {
    Set-Content (Get-Content $_ | Select-Object -Skip 2) -Path "$PSScriptRoot/temp"
}

$header = @(
"skip0"
"nm"
# Acquiring
"rel"
"y"
"m"
"os"
"src"
"bun"
"str"
"fac"
"org"
"fam"
"skip1"
# Ship Role / Highest Seats
"mp"
"skip2"
"skiptac"
"skipeng"
"skipsci"
"skipuni"
"skip3"
"mxi"
"mxc"
"mxp"
"mxo"
"mxm"
"skipfull"
"skip4"
# Defense
"hul"
"hmd"
"smd"
"skip5"
# Mobility
"trn"
"imp"
"inr"
"skip6"
# Power Bonus
"bw"
"bs"
"be"
"ba"
"skip7"
# BOff 1
"boff1rank"
"boff1type"
"boff1spec"
"skip8"
# BOff 2
"boff2rank"
"boff2type"
"boff2spec"
"skip9"
# BOff 3
"boff3rank"
"boff3type"
"boff3spec"
"skip10"
# BOff 4
"boff4rank"
"boff4type"
"boff4spec"
"skip11"
# BOff 5
"boff5rank"
"boff5type"
"boff5spec"
"skip12"
# BOff 6
"boff6rank"
"boff6type"
"boff6spec"
"skip13"
# Weapons
"fa"
"for"
"aft"
"dhc"
"exp"
# Misc Equips
"skip14"
"hng"
"dev"
"skip15"
# Consoles
"flt"
"ct"
"ce"
"cs"
"cu"
"skip16"
# Cruiser Commands
"ccw"
"ccs"
"cce"
"cct"
"skip17"
# Science Vessel
"sd"
"st"
"sa"
"tm"
"skip18"
# Misc
"sng"
"clk"
"flk"
"skip19"
# Trait
"trt"
"trs"
"skip20"
# Admiralty
"skipadmrarity"
"skipadmtype"
"skipadmeng"
"skipadmtac"
"skipadmsci"
"skipbonus"
"skip21"
# Seat Counts
"skipconfigseat1"
"skipconfigseat2"
"skip22"
# Console Counts
"skipconsoleconfig1"
"skipconsoleconfig2"
"skip23"
# Cruiser Command Analysis
"skipcca1"
"skipcca2"
"url"
)

# read in csv data from temp file and make some modifications while reading it
$csvData = Import-Csv -Path "$PSScriptRoot/temp" -Header $header | ForEach-Object {

    # remove abbreviations in name field
    $_.nm = $_.nm.replace('MW', 'Miracle Worker')
    $_.nm = $_.nm.replace('S31', 'Section 31');

    # add (T6) to some names as some URLs require it
	$_.nm = $_.nm.replace('Fleet Akira Heavy Strike Wing Escort', 'Fleet Akira Heavy Strike Wing Escort (T6)')
	$_.nm = $_.nm.replace('Fleet Avenger Battlecruiser', 'Fleet Avenger Battlecruiser (T6)')
	$_.nm = $_.nm.replace('Fleet Caitian Atrox Carrier', 'Fleet Caitian Atrox Carrier (T6)')
	$_.nm = $_.nm.replace('Fleet Galaxy Dreadnought Cruiser', 'Fleet Galaxy Dreadnought Cruiser (T6)')
	$_.nm = $_.nm.replace('Fleet Ha''apax Advanced Warbird', 'Fleet Ha''apax Advanced Warbird (T6)')
	$_.nm = $_.nm.replace('Fleet Hephaestus Advanced Escort', 'Fleet Hephaestus Advanced Escort (T6)')
	$_.nm = $_.nm.replace('Fleet Mogh Battlecruiser', 'Fleet Mogh Battlecruiser (T6)')
	$_.nm = $_.nm.replace('Fleet Vo''Quv Carrier', 'Fleet Vo''Quv Carrier (T6)')
	$_.nm = $_.nm.replace('Jem''Hadar Dreadnought Carrier', 'Jem''Hadar Dreadnought Carrier (T6)')
	$_.nm = $_.nm.replace('Jem''Hadar Heavy Strike Wing Escort', 'Jem''Hadar Heavy Strike Wing Escort (T6)')
	$_.nm = $_.nm.replace('Risian corvette', 'Risian corvette (T6)')
	$_.nm = $_.nm.replace('Risian Luxury Cruiser', 'Risian Luxury Cruiser (T6)')
	$_.nm = $_.nm.replace('Risian Pilot corvette', 'Risian Pilot corvette (T6)')

    # remove abbreviations from mastery package
    $_.mp = $_.mp.replace('WB','Warbird')
    $_.mp = $_.mp.replace('Dread ', 'Dreadnought ') # trailing space is needed

    # correct the Science Destroyers to actually be science mode
    if ($_.nm -eq 'Titan Science Destroyer') {
        $_.nm = $_.nm + ' (Science Mode)'
        $_.exp = 'No'
        $_.boff2rank = 3
    }
    if ($_.nm -eq 'Section 31 Intel Science Destroyer') {
        $_.nm = $_.nm + ' (Science Mode)'
        $_.exp = 'No'
        $_.boff2rank = 3
    }
    if ($_.nm -eq 'Fleet Comet Science Destroyer') {
        $_.nm = $_.nm + ' (Science Mode)'
        $_.exp = 'No'
        $_.boff2rank = 3
    }
    if ($_.nm -eq 'Courage Command Science Destroyer') {
        $_.nm = $_.nm + ' (Science Mode)'
        $_.exp = 'No'
        $_.boff2rank = 3
    }
    if ($_.nm -eq 'Mirror Crossfield Science Destroyer') {
        $_.nm = $_.nm + ' (Science Mode)'
        $_.exp = 'No'
        $_.boff2rank = 3
    }

    $_
}

# we can delete the csv and temp files now
Remove-Item -Path "$PSScriptRoot/$csvname"
Remove-Item -Path "$PSScriptRoot/temp"

# clone all the Science Destroyers (Science Mode) and make them (Tactical Mode)
$list_science_destroyers = 'Titan Science Destroyer (Science Mode)', 'Section 31 Intel Science Destroyer (Science Mode)', 'Fleet Comet Science Destroyer (Science Mode)', 'Courage Command Science Destroyer (Science Mode)', 'Mirror Crossfield Science Destroyer (Science Mode)'
Foreach ($sd in $list_science_destroyers) {

    # get the object from the csv collection
    $row = $csvData | Where-Object -Property nm -eq -Value $sd

    # make a deep copy using serialize/deserialize (this might be overkill, but it works)
    $row = [System.Management.Automation.PSSerializer]::Deserialize( [System.Management.Automation.PSSerializer]::Serialize( $row ) )

    # modify the copy to have Tactical Mode stats

    # change the name
    $row.nm = $row.nm.Replace('Science Mode', 'Tactical Mode')
    
    # adjust the seating
    $row.boff1rank = 3
    $row.boff2rank = 4

    # Enable the experimental weapon
    $row.exp = 'Yes'

    # set the "science stuff" to "No"
    $row.sd = 'No'
    $row.sa = 'No'
    $row.st = 'No'

    # Note: dividing by 1 converts strings to numbers

    if ($sd -eq 'Courage Command Science Destroyer (Science Mode)') {

        # reduce the shield capacity by 20%
        $row.smd = $row.smd/1 * 0.8
		
        # increase the hull capacity by 20%
        $row.hmd = $row.hmd/1 * 1.2

    } else {
        
        # reduce the shield capacity by 10%
        $row.smd = $row.smd/1 * 0.9

        # increase the impulse by 10%
        $row.imp = $row.imp/1 * 1.1

        # increase the turn rate and inertia
        $row.trn = $row.trn/1 + 2
        $row.inr = $row.inr/1 + 10

        # modify the bonus power
        if ($sd -eq 'Mirror Crossfield Science Destroyer (Science Mode)') {
            $row.ba = 0
            $row.bw = 15
        } else {
            $row.ba = 5
            $row.bw = 15
        }
    }

    # add it to the collection
    $csvData += $row

}

# sort it by ship name
# note: casting to char array fixes incorrect sorting order
$csvData = $csvData | Sort-Object -Property { [char[]] $_.nm }

$return = "`r`n"
$count = 0

$rowseparator = ''

$list_null_to_empty_string = "rel", "bun", "str", "fac", "fam", "trt", "trs"
$list_null_to_zero = "mxi", "mxc", "mxp", "mxo", "mxm", "bw", "bs", "be","ba", "hng", "cu"
$list_null_to_no = "dhc", "exp", "flt", "ccw", "ccs", "cce", "cct", "sd", "st", "sa", "tm", "sng",  "clk", "flk"

# helper function to convert seat type/spec into a numeric code
function seatType {
    $seatTypes = @{ Uni = 0; Tac = 1; Eng = 2; Sci = 3; Int = 4; Cmd = 5; Pil = 6; Tmp = 7; MW = 8 }
    if ($args[0]) {
        $seatTypes[$args[0]]
    } else {
        0
    }
}

# start of ship/seat JSON data
$shipdata = "["
$seatdata = "["

$csvData | Foreach-Object {

    # reset these variables for each iteration
    $tcn = 0
    $tab = 0
    $colseparator = ''

    # build the row for each ship
    $shipdata += "$rowseparator$return    {`"id`"`:$count,"

    foreach ($property in $_.PSObject.Properties)
    {
        if (-not (($property.Name -like 'skip*') -or ($property.Name -like 'boff*'))) {

            $name = $property.Name
            $value = $property.Value

            if ($value -match "^[+-]?((\d+(\.\d*)?)|(\.\d+))$") {
                $shipdata += "$colseparator`"$name`"`:$value"
            } elseif ($value -eq "") {
                if ($list_null_to_empty_string -contains $name) {
                    $shipdata += "$colseparator`"$name`"`:`"`""
                } elseif ($list_null_to_zero -contains $name) {
                    $shipdata += "$colseparator`"$name`"`:0"
                } elseif ($list_null_to_no -contains $name) {
                    $shipdata += "$colseparator`"$name`"`:`"No`""
                } else {
                    # found something we didn't expect
                    "unexpected null value in: $name"
                }
            } else {
                $shipdata += "$colseparator`"$name`"`:`"$value`""
            }
            $colseparator = ','

            # if this property is a console count, add it to the total
            if (@("ct", "ce", "cs", "cu") -contains $name) {
                $tcn += $value
            }

            # insert the total consoles after universal consoles
            if ($name -eq "cu") {
                $shipdata += "$colseparator`"tcn`"`:$tcn"
            }

        }

        if ($property.Name -like 'boff*rank') {
            $tab += $property.Value
        }
        
    }
    # append total abilities to end of data
    $shipdata += "$colseparator`"tab`"`:$tab}"
    $tab = 0


    # dump seat data
    $seatdata += "$rowseparator$return    {`"id`"`:$count,`"seats`"`:["
    $seatdata += "{`"rank`"`:$($_.boff1rank),`"type`"`:$(seatType $_.boff1type),`"spec`"`:$(seatType $_.boff1spec)}"
    $seatdata += ",{`"rank`"`:$($_.boff2rank),`"type`"`:$(seatType $_.boff2type),`"spec`"`:$(seatType $_.boff2spec)}"
    $seatdata += ",{`"rank`"`:$($_.boff3rank),`"type`"`:$(seatType $_.boff3type),`"spec`"`:$(seatType $_.boff3spec)}"
    $seatdata += ",{`"rank`"`:$($_.boff4rank),`"type`"`:$(seatType $_.boff4type),`"spec`"`:$(seatType $_.boff4spec)}"
    if ($_.boff5rank) {
        $seatdata += ",{`"rank`"`:$($_.boff5rank),`"type`"`:$(seatType $_.boff5type),`"spec`"`:$(seatType $_.boff5spec)}"
    }
    if ($_.boff6rank) {
        $seatdata += ",{`"rank`"`:$($_.boff6rank),`"type`"`:$(seatType $_.boff6type),`"spec`"`:$(seatType $_.boff6spec)}"
    }
    $seatdata += "]}"


    $rowseparator = ','
    $count++
}

# end of ship/seat JSON data
$shipdata += "$return]$return"
$seatdata += "$return]$return"

$lastupdated = "{ `"date`"`: `"$today`" }"

# write out the data files
$assetpath = "$PSScriptRoot/../src/assets"
$shipdata | Out-File -Encoding Ascii "$assetpath/shipdata.json"
$seatdata | Out-File -Encoding Ascii "$assetpath/seatdata.json"
$lastupdated | Out-File -Encoding Ascii -filepath "$assetpath/lastupdated.json"
