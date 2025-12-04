import * as React from "react"
import {Decision} from "@/reducer/app-reducer"
import {PropsWithChildren, ReactElement, ReactNode, useState} from "react"
import {LoadingSpinner} from "@/components/ui/LoadingSpinner"
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

    const [open, setOpen] = useState(false)

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
                <Button 
                    className="grow rounded-none bg-neutral-700 border-radius-0 text-black font-mono font-semibold" 
                    disabled={!config}
                    onClick={() => setOpen(true)}
                >
                    configure
                </Button>
                {open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setOpen(false)}>
                        <div 
                            className="relative w-[90vw] min-w-[900px] max-w-5xl max-h-[80vh] overflow-y-auto rounded-2xl border border-primary/70 bg-black/95 p-6 text-amber-500"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-200 text-xl leading-none"
                                aria-label="Close"
                            >
                                ×
                            </button>
                            {config}
                        </div>
                    </div>
                )}
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
