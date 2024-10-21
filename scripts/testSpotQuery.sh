set -ex

baseUrl=http://localhost:8089

hours=6

#startTime=$(date -d "today 21:00" +%s)
#endTime=$(date -d "tomorrow 21:00" +%s)

startTime=$(date -d "yesterday 21:00" +%s)
endTime=$(date -d "today 21:00" +%s)

peakTransfer=0.0445
offPeakTransfer=0.0274
transferPars="&peakTransferPrice=${peakTransfer}&offPeakTransferPrice=${offPeakTransfer}"

url="${baseUrl}/query?hours=${hours}&startTime=${startTime}&endTime=${endTime}${transferPars}"

callApi() {
   curl -s ${1} | jq
}

callApi $url # LowestPrices
callApi "$url&queryMode=HighestPrices"
callApi "$url&queryMode=OverAveragePrices"
callApi "$url&queryMode=WeightedPrices"
callApi "$url&queryMode=SequentialPrices"

