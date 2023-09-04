set -ex

baseUrl=http://localhost:8089

hours=6

startTime=$(date -d "yesterday 21:00" +%s)
endTime=$(date -d "today 21:00" +%s)

peakTransfer=0.0445
offPeakTransfer=0.0274

curl -s "${baseUrl}/query?hours=${hours}&startTime=${startTime}&endTime=${endTime}&peakTransferPrice=${peakTransfer}&offPeakTransferPrice=${offPeakTransfer}" | jq
