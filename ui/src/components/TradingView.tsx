import * as React from "react"
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts"
import {APP_CONFIG} from "@/config"
import {AppState} from "@/state/app-reducer"
import {ChainState} from "@/state/chain-reducer"

type TradingViewProps = {
    appState: AppState
    chainState: ChainState
    priceData: Array<number>
    sentimentData: Array<string>
}
export const TradingView = (props: TradingViewProps) => {
    const {treasury, orderbook} = props.chainState
    const tweet = props.sentimentData[props.sentimentData.length - 1] ?? ""

    return (
        <div>
            <PriceChart priceData={props.priceData}/>
            <div className="grid grid-cols-4 gap-1 text-left">
                <div className="font-extrabold">Tweet</div>
                <div className="col-span-3">{tweet}</div>
                <div className="font-extrabold">Company balance</div>
                <div className="col-span-3">{APP_CONFIG.token} {treasury.balance.toLocaleString()}</div>
                <div className="font-extrabold">Order book balance</div>
                <div className="col-span-3">{APP_CONFIG.token} {orderbook.balance.toLocaleString()}</div>
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
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis
                    label="Epoch"
                />
                <YAxis
                    label="Price"
                />
                <Tooltip/>
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{r: 4}}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
