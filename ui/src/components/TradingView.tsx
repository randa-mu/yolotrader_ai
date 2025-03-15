import * as React from "react"
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts"
import { NewsData } from "@/data/news"
import {ChainState} from "@/state/chain-reducer"
import {AppState} from "@/state/app-reducer"

type TradingViewProps = {
    appState: AppState
    chainState: ChainState
    priceData: Array<number>
    sentimentData: Array<NewsData>
}
export const TradingView = (props: TradingViewProps) => {
    const newsItems = props.sentimentData
    console.log(newsItems)

    return (
        <div className="basis-3/5 h-full flex flex-col border border-neutral-800 overflow-hidden text-left text-sm">
            <div className="w-full h-100">
                <div className="w-full p-1 px-2 grid grid-cols-1 gap-2 bg-neutral-800 font-mono text-neutral-400">
                    <span className="col-span-1">$MOON tracker</span>
                </div>
                <div className="pt-6">
                <PriceChart priceData={props.priceData}/>
                </div>
            </div>
            <div className="w-full p-1 px-2 grid grid-cols-10 gap-2 bg-neutral-800 font-mono text-neutral-400">
                <span className="col-span-1">Ticker</span>
                <span className="col-span-6">News</span>
                <span className="col-span-3">Source</span>
            </div>
            <div className="w-full h-120 overflow-y-auto">


            <div className="flex flex-col overflow-auto">
                {[...newsItems].reverse().map((item, index) => (
                    <div
                    key={`${item.source}-${item.epoch}-${index}`}
                    className={`
                        px-2 grid grid-cols-10 gap-2 font-mono font-normal text-amber-500 p-1 border-b border-gray-800
                        ${index === 0 ? 'animate-new-item' : ''}
                    `}
                    >
                    <div className="col-span-1">MOON</div>
                    <div className="col-span-6">{item.content}</div>
                    <div className="col-span-3">{item.source}</div>
                    </div>
                ))}
            </div>
            </div>

        </div>
    )
}

type PriceChartProps = {
    priceData: Array<number>
}

function PriceChart(props: PriceChartProps) {
    const remappedData = props.priceData.map((price, index) => ({name: `${index}`, value: price}))
    return (
        <ResponsiveContainer
            width="100%"
            height={300}
        >
            <LineChart
                data={remappedData}
                margin={{top: 10, right: 30, left: 0, bottom: 10}}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#333333"
                />
                <XAxis
                    label={{
                        value: "Epoch",
                        position: "insideBottom",
                        offset: -5,
                        angle: 0,
                        style: {
                            fontFamily: "monospace",
                            fill: "#d97706",
                            textAnchor: "middle"
                        }
                    }}
                    stroke="#666666"
                    tick={{ fill: "#d97706", fontFamily: "monospace" }}
                />
                <YAxis
                    label={{
                        value: "Price",
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                        style: {
                            fontFamily: "monospace",
                            fill: "#d97706",
                            textAnchor: "middle"
                        }
                    }}
                    width={60}
                    stroke="#666666"
                    tick={{ fill: "#d97706", fontFamily: "monospace", textAnchor: "start", angle: 0, dx: -30 }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#000000',
                        borderColor: '#FFFFFF',
                        fontFamily: "monospace",
                        color: '#d97706'
                    }}
                    itemStyle={{ color: '#d97706' }}
                    formatter={(value) => [`${value}`, 'Price']}
                    labelFormatter={() => ''}
                />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#FFFFFF"
                    strokeWidth={1}
                    dot={{r: 4, fill: "#000000", stroke: "#FFFFFF"}}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
