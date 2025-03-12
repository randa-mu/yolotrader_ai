import * as React from "react"
import {PropsWithChildren, ReactElement, ReactNode} from "react"
import {LoadingSpinner} from "@/components/ui/LoadingSpinner"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Button} from "@/components/ui/button"

type AgentCardProps = {
    isLoading: boolean
    children: ReactNode
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

    return (
        <div className="grid grid-cols-4 space-x-2 p-2 min-h-20 min-w-20 text-center align-middle">
            <div className="text-2xl font-extrabold align-middle text-center">{title}</div>
            <div>
                {props.isLoading
                    ? <LoadingSpinner/>
                    : content
                }
            </div>
            <div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button disabled={props.isLoading || !reason}>explain</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        {reason}
                    </PopoverContent>
                </Popover>
            </div>
            <div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button disabled={!config}>configure</Button>
                    </PopoverTrigger>
                    <PopoverContent className="min-w-200 min-h-100">
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
