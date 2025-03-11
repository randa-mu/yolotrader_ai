import * as React from "react"
import {AppState} from "@/reducer/appReducer"
import {MarketData} from "@/reducer/data.js"
import {useEffect, useState} from "react"
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts"

type TradingViewProps = {
    state: AppState
    marketState: MarketData
}
export const TradingView = (props: TradingViewProps) => {
    const {epoch} = props.state
    const {company, orderBook} = props.state.balances
    const {tweet} = props.marketState

    const [priceData, setPriceData] = useState([])

    useEffect(() => {
        setPriceData([...priceData, props.marketState.price])
    }, [props.marketState])

    return (
        <div>
            <div>
                <PriceChart priceData={priceData}/>
                <p>Tweet: {tweet}</p>
            </div>
            <div>
                <p>Company balance: {company}</p>
                <p>Order book balance: {orderBook}</p>
            </div>
            <p>Epoch: {epoch}</p>
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
            <LineChart data={remappedData} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis label="Epoch" />
                <YAxis label="Price" />
                <Tooltip/>
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={{r: 4}}/>
            </LineChart>
        </ResponsiveContainer>
    )
}
