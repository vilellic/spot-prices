set -ex

## mac: brew install coreutils

baseUrl=http://localhost:8089

hours=6

startTime=$(gdate -d "yesterday 21:00" +%s)
endTime=$(gdate -d "today 21:00" +%s)

peakTransfer=0.0445
offPeakTransfer=0.0274

curl -s "${baseUrl}/query?hours=${hours}&startTime=${startTime}&endTime=${endTime}&peakTransferPrice=${peakTransfer}&offPeakTransferPrice=${offPeakTransfer}" | jq
