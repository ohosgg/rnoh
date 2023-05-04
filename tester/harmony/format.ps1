$directoryPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$filePaths = Get-ChildItem $directoryPath -Recurse -Include *.h, *.cpp |
Where-Object {
  $_.DirectoryName -notmatch 'third-party' -and
  $_.DirectoryName -notmatch 'patches' -and
  $_.DirectoryName -notmatch 'node_modules' -and
  $_.DirectoryName -notmatch '.cxx' -and
  $_.DirectoryName -notmatch 'build'
}
foreach ($filePath in $filePaths) {
  & "clang-format.exe" -style=file -i $filePath.FullName
}