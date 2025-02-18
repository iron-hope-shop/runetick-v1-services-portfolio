import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

const TinyChart = ({ data, color }) => (
    <ResponsiveContainer width="100%" height={50}>
        <AreaChart data={data.map((value, index) => ({ value, index }))}>
            <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.1} />
        </AreaChart>
    </ResponsiveContainer>
);

export default TinyChart;