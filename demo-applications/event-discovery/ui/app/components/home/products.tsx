import React from 'react';
import {Button} from "~/components/ui/button";
import {MinusCircle, PlusCircle} from "lucide-react";

export interface ProductsProps {
    highlights: HighlightProps[]
    onAdd: (id: string) => void;
    onRemove: (id: string) => void;
}

export interface HighlightProps {
    id: string,
    icon: React.ReactNode;
    title: string | React.ReactNode;
    price: number;
}

const Products: React.FC<ProductsProps> = ({
                                               highlights,
                                               onAdd,
                                               onRemove,
                                           }) => {
    return (
        <div className="bg-background">
            <div
                className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-12 sm:pt-12">
                <div>
                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 text-base content-center">
                        {
                            highlights.map(h => {
                                return <div key={h.id}>
                                    <div>
                                        <div
                                            className="flex items-center justify-center gap-2">
                                            <div>
                                                {h.icon}
                                            </div>
                                            <h3 className="text-secondary-foreground text-xl text-balance p-4">
                                                {h.title}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <span className="block text-balance text-lg">
                                            $ {h.price}
                                        </span>
                                        <Button onClick={() => onAdd(h.id)} className="m-4">
                                            <PlusCircle className="h-5 w-5 mr-2"/>
                                            Add
                                        </Button>
                                        <Button variant={'ghost'} onClick={() => onRemove(h.id)}
                                                className="m-8">
                                            <MinusCircle className="h-5 w-5 mr-2"/>
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Products;
