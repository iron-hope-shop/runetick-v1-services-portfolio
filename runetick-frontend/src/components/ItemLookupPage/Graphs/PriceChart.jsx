import React, { useRef, useState, useEffect } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from "recharts";
// import PriceTooltip from "./PriceTooltip";

const PriceChart = ({ formattedData, chartRef, isMobile, handleLegendClick, getMargin, interval, priceDomain, hiddenSeries }) => {
    const formatYAxis = (tickItem) => {
      if (tickItem >= 1000000000) {
        return `${(tickItem / 1000000000).toFixed(1)}B`;
      } else if (tickItem >= 1000000) {
        return `${(tickItem / 1000000).toFixed(1)}M`;
      } else if (tickItem >= 1000) {
        return `${(tickItem / 1000).toFixed(1)}K`;
      }
      return `${tickItem.toLocaleString()}`;
    };
  
    const formatXAxis = (tickItem) => {
      const date = new Date(tickItem * 1000);
      const options = { month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    };
  
    return (
        <LineChart 
          data={formattedData} 
          ref={chartRef}
          margin={getMargin()}
          dot={false}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatXAxis} 
            interval={interval}
            tick={{ fontSize: isMobile ? 10 : 12 }}
            label={isMobile ? null : { value: "Time", position: 'insideBottom', dy: 20 }}
          />
          <YAxis 
            yAxisId="left" 
            tickFormatter={formatYAxis} 
            label={isMobile ? null : { value: "Price (gp)", angle: -90, position: 'insideLeft', dy: 30, dx: -32 }} 
            domain={priceDomain}
          />
          {/* <RechartsTooltip content={<PriceTooltip />} /> */}
          <Legend 
            verticalAlign={isMobile ? "bottom" : "top"} 
            height={36} 
            onClick={handleLegendClick} 
            wrapperStyle={isMobile ? { position: 'relative', marginTop: '10px' } : null}
          />
          <Line 
            yAxisId="left" 
            dataKey="avgHighPrice" 
            stroke="lime" 
            dot={false}
            hide={hiddenSeries.includes('avgHighPrice')}
            // type="monotone" 
            // strokeDasharray="1 1"
          />
          <Line 
            yAxisId="left" 
            dataKey="avgLowPrice" 
            stroke="rgba(255, 0, 0, 0.3)" 
            dot={false}
            hide={hiddenSeries.includes('avgLowPrice')}
            // strokeDasharray="3 4 5 2"
          />
        </LineChart>
    );
  }


export default PriceChart;