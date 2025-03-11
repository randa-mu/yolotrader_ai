import * as React from "react"
import {useEffect, useState} from "react"
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts"
import {AppState} from "@/reducer/app-reducer"
import {MarketData} from "@/data/market-data"

type TradingViewProps = {
    state: AppState
    marketState: MarketData
}
export const TradingView = (props: TradingViewProps) => {
    const {company, orderBook} = props.state.balances
    const {tweet} = props.marketState

    const [priceData, setPriceData] = useState([])

    useEffect(() => {
        setPriceData([...priceData, props.marketState.price])
    }, [props.marketState])

    return (
        <div>
            <PriceChart priceData={priceData}/>
            <div className="grid grid-cols-4 gap-1 text-left">
                <div className="font-extrabold">Tweet</div>
                <div className="col-span-3">{tweet}</div>
                <div className="font-extrabold">Company balance</div>
                <div className="col-span-3">{company}</div>
                <div className="font-extrabold">Order book balance</div>
                <div className="col-span-3">{orderBook}</div>
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
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={remappedData} margin={{top: 10, right: 30, left: 0, bottom: 10}}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis label="Epoch"/>
                <YAxis label="Price"/>
                <Tooltip/>
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={{r: 4}}/>
            </LineChart>
        </ResponsiveContainer>
    )
}
