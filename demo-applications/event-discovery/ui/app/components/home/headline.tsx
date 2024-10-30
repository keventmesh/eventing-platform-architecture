import React from 'react';
import {Button} from '~/components/ui/button';
import {ArrowRight} from 'lucide-react';
import {Form} from "@remix-run/react";
import {cn} from "~/lib/cn";

interface HeadlineProps {
    title: string | React.ReactNode;
    subtitle: string | React.ReactNode;
}

const Headline: React.FC<HeadlineProps> = ({
                                               title,
                                               subtitle,
                                           }) => {
    return (
        <div className="bg-background">
            <div
                className={cn(
                    "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32"
                )}>
                <div className="text-center pb-10">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-secondary-foreground tracking-tight">
                        {title}
                    </h1>
                    <div className="mt-8 max-w-3xl mx-auto text-xl sm:text-2xl text-muted-foreground">
                        {subtitle}
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Headline;
