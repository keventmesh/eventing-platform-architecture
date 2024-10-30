import type {MetaFunction} from "@remix-run/node";

import Headline from "~/components/home/headline";
import Navbar, {NavbarLinkProps} from "~/components/ui/navbar";
import {HighlightText} from "~/components/ui/highlight-text";
import Products, {HighlightProps} from "~/components/home/products";

import {ChartNoAxesCombined, CircleGauge, PackageCheck, Telescope} from 'lucide-react';
import React from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "~/components/ui/table";
import {ColumnDef, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {useToast} from "~/hooks/use-toast";
import {Toaster} from "~/components/ui/toaster";

export const meta: MetaFunction = () => {
    return [
        {title: "Event Discovery"},
        {
            name: "description",
            content: "Knative Eventing Event Discovery"
        },
    ];
};

const ctaRoute: string = "/order"
const ctaText: string = "Order"

const navbarLinks: NavbarLinkProps[][] = [
    // Each top-level array is grouped and visually spaced from each other.
    //
    // Elements marked with `hidden sm:hidden md:flex` are hidden on small screens and placed in
    // a menu that shows up when the screen is small.
    [
        {
            href: "#icons",
            text: "Icons",
        },
        {
            href: "#summary",
            text: "Summary",
            className: "hidden sm:hidden md:flex",
        },
        {
            href: "#events",
            text: "Events",
            className: "hidden sm:hidden md:flex",
        },
    ],
]

const iconClass = "w-14 h-14"

export default function Index() {

    const products: HighlightProps[] = [
        {
            id: 'f656dbe5-7bec-45c3-89e3-3c18dafc645d',
            title: "Circle gauge icon",
            icon: <CircleGauge className={iconClass}/>,
            price: 3.99
        },
        {
            id: '1f3c4ca7-66c2-4d04-8939-37413b441b6c',
            title: "Package icon",
            icon: <PackageCheck className={iconClass}/>,
            price: 9.99
        },
        {
            id: '58658052-1d5b-4af8-b185-586857bd5174',
            title: "Telescope icon",
            icon: <Telescope className={iconClass}/>,
            price: 1.99
        },
        {
            id: '49af074c-ae22-498b-a633-ea341ce032dd',
            title: "Chart without axes icon",
            icon: <ChartNoAxesCombined className={iconClass}/>,
            price: 4.99
        }
    ]

    const [selectedProducts, setSelectedProducts] = React.useState<string[]>([])

    const onCartChanged: (id: string, action: string) => void = async (id, action) => {
        const formData = new FormData();
        const p = products.find(value => value.id === id)
        if (p === undefined) {
            return
        }

        const data = {
            'product': {
                'id': p.id,
                'title': p.title,
                'price': p.price,
            },
            'action': action
        }
        formData.append("data", JSON.stringify(data));

        console.log("Submitting formData", formData)

        const response = await fetch("/select-product", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            console.log("Success onCartChanged", data, response.status)
        } else {
            console.log("Failure onCartChanged", data, response.status, response.statusText, response.headers, await response.json())
        }
    }

    const onProductAdd: (id: string) => void = (id) => {
        setSelectedProducts(prevState => {
            if (prevState.find(v => v === id) !== undefined) {
                return prevState
            }
            return [...prevState, id]
        })
        onCartChanged(id, "added")
    }

    const onProductRemove: (id: string) => void = (id) => {
        setSelectedProducts(prevState => prevState.filter(v => id !== v))
        onCartChanged(id, "removed")
    }

    const selectedTable = selectedProducts.map((v) => {
        const found = products.find(value => value.id === v)
        if (found === undefined) {
            throw new Error("Product not found")
        }
        return found
    })

    const {toast} = useToast()

    const onOrder: () => void = async () => {
        const formData = new FormData();
        if (selectedProducts.length <= 0) {
            toast({
                title: "No icons selected!",
                description: "Select a few icons.",
            })
            return
        }

        const data = {
            'orderItems': selectedProducts.map(id => {
                const p = products.find(s => id == s.id)
                if (p === undefined) {
                    return null
                }
                return {
                    'productId': p.id,
                    'productName': p.title,
                    'quantity': 1,
                    'price': p.price,
                }
            }),
        }
        formData.append("data", JSON.stringify(data));

        console.log("Submitting order", data)

        try {
            const response = await fetch("/order", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                console.log("Success order", data)
                toast({
                    title: "Order confirmed!",
                    description: "You’ll receive a confirmation shortly.",
                })
            } else {
                console.log("Failure order", data, response.status, response.statusText, response.headers, await response.json())
                toast({
                    title: "Order failed!",
                    description: "Retry.",
                })
            }
        } catch (e) {
            toast({
                title: "Order failed!",
                description: "Retry.",
            })
        }
    }

    return (
        <div className="min-h-screen">
            <Navbar links={navbarLinks} ctaText={ctaText} ctaOnClick={onOrder}/>
            <Headline
                title={
                    <div className="m-auto">
                        <span className="text-4xl md:text-7xl block">
                            Knative Eventing
                        </span>
                        <HighlightText className="text-5xl md:text-8xl block" gradient={true}
                                       text={"Discovery"}/>
                    </div>
                }
                subtitle={
                    <div className="text-xl text-center text-balance">
                        <div className="text-base text-secondary-foreground block pt-4">
                            <h3>
                                Demo application.
                            </h3>
                        </div>
                    </div>
                }
            />
            <div id="icons" className="text-xl text-center text-balance pt-12">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-secondary-foreground tracking-tight">
                    <HighlightText text={"Icons"}/>
                </h1>
                <Products highlights={products} onAdd={onProductAdd} onRemove={onProductRemove}/>
            </div>
            <div id="summary" className="text-xl text-center text-balance pt-8">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-secondary-foreground tracking-tight">
                    <HighlightText text={"Summary"}/>
                </h1>
                <div className="text-xl text-center text-balance mx-32 my-8">
                    <DataTable columns={columns} data={selectedTable}/>
                </div>
            </div>
            <Toaster />
        </div>
    );
}

const columns: ColumnDef<HighlightProps>[] = [
    {
        accessorKey: "id",
        header: "Id",
    },
    {
        accessorKey: "title",
        header: "Title",
    },
    {
        accessorKey: "price",
        header: () => <div className="text-center">Price</div>,
        cell: ({row}) => {
            const price = parseFloat(row.getValue("price"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(price)

            return <div className="text-center font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "icon",
        header: () => <div className="text-center">Icon</div>,
        cell: ({row}) => {
            const icon = row.getValue<React.ReactNode>("icon")
            return <div className="text-center font-medium">{icon}</div>
        },
    },
]

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({
                                             columns,
                                             data,
                                         }: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
