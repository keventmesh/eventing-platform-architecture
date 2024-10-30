import React from "react";
import {cn} from "~/lib/cn";

interface HighlightTextProps {
    text: string;
    className?: string;
    gradient?: boolean
}

export const HighlightText: React.FC<HighlightTextProps> = ({text, className, gradient}) => {
    return (
        <span
            className={cn(
                "px-2 py-0.5 md:px-4 m-2 md:m-1.5d",
                gradient ? 'gradient-highlight' : 'bg-secondary/50 text-primary leading-relaxed whitespace-nowrap rounded',
                className
            )}>
        {text}
    </span>
    )
}