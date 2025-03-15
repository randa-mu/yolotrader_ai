import * as React from "react"
import {Decision} from "@/reducer/app-reducer"
import {PropsWithChildren, ReactElement, ReactNode} from "react"
import {LoadingSpinner} from "@/components/ui/LoadingSpinner"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Button} from "@/components/ui/button"

type AgentCardProps = {
    isLoading: boolean
    children: ReactNode
    value: Decision
}

export const AgentCard = (props: AgentCardProps) => {
    let title: ReactElement
    let config: ReactElement
    let content: ReactElement
    let reason: ReactElement

    React.Children.forEach(props.children, (child) => {
        if (!React.isValidElement(child)) {
            return
        } else if (child.type === AgentTitle) {
            title = child
        } else if (child.type === AgentConfiguration) {
            config = child
        } else if (child.type === AgentContent) {
            content = child
        } else if (child.type === AgentReasoning) {
            reason = child
        } else {
            return
        }
    })

        const titleColour = () => {
        switch (props.value) {
            case "BUY":
                return "text-green-500"
            case "SELL":
                return "text-red-500"
            default:
                return "text-yellow-500"
        }
    }

    return (
        <div className="flex-col p-2 min-h-20 min-w-20 text-left font-mono align-middle">
            <div className="h-40 flex items-center justify-center">
                <div className="w-32 flex flex-col items-center justify-center">
                        {props.isLoading
                            ? <LoadingSpinner/>
                            : content
                        }
                    <div className={`${titleColour()} text-lg font-medium font-mono align-middle text-center className="w-full"`}>{title}</div>
                </div>

                <div className="flex-1 text-amber-500 font-mono ml-4">     
                    {reason && (
                        <div className="text-sm">
                        {reason}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button className="grow rounded-none bg-neutral-700 border-radius-0 text-black font-mono font-semibold" disabled={!config}>configure</Button>
                    </PopoverTrigger>
                    <PopoverContent className="min-w-150 min-h-100 font-mono text-amber-500 bg-black">
                        {config}
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

const AgentTitle = ({children}: PropsWithChildren) => <>{children}</>
const AgentContent = ({children}: PropsWithChildren) => <>{children}</>
const AgentReasoning = ({children}: PropsWithChildren) => <>{children}</>
const AgentConfiguration = ({children}: PropsWithChildren) => <>{children}</>

const DefaultConfiguration = <Button disabled>Configure</Button>

AgentCard.Title = AgentTitle
AgentCard.Configuration = AgentConfiguration
AgentCard.Content = AgentContent
AgentCard.Reasoning = AgentReasoning
