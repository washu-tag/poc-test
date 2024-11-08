/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useEffect, createRef, useMemo } from 'react';
import { styled } from '@superset-ui/core';
import { VectorSearchProps, VectorSearchStylesProps } from './types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Brush } from 'recharts';

const Styles = styled.div<VectorSearchStylesProps>`
  height: ${({ height }) => height};
  width: ${({ width }) => width};
`;

/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

export default function VectorSearch(props: VectorSearchProps) {
  // height and width are the height and width of the DOM element as it exists in the dashboard.
  // There is also a `data` prop, which is, of course, your DATA 🎉
  const { data, height, width } = props;

  const rootElem = createRef<HTMLDivElement>();

  // Often, you just want to access the DOM and do whatever you want.
  // Here, you can do that with createRef, and the useEffect hook.
  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  });
  const chartData = useMemo(() => {
    return data.map((d, index) => ({
      ...d,
      index,
    }));
  }, [data]);

  console.log('Plugin props', props);

  return (
    <Styles ref={rootElem} height={height} width={width}>
      <ResponsiveContainer height={height} width="80%">
        <LineChart data={chartData}>
          <XAxis />
          <YAxis
            domain={[0, 2]}
            label={{ value: 'Cosine Distance', angle: -90, position: 'left' }}
          />
          <Tooltip
            formatter={(value: string | number | (string | number)[]) =>
              Array.isArray(value)
                ? value.map((v) => parseFloat(v.toString()).toFixed(4)).join(', ')
                : parseFloat(value.toString()).toFixed(4)
            }
            labelFormatter={(label: string | number) => `Result ${label}`}
          />
          <Line type="monotone" dataKey="distance" dot={false} />
          <Brush dataKey="distance" height={30} stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </Styles>
  );
}
