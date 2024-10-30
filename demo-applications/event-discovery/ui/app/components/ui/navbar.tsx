import React, {MouseEventHandler} from 'react';
import {ArrowRight, Menu} from 'lucide-react';
import {Button} from '~/components/ui/button';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger
} from "~/components/ui/navigation-menu";
import {cn} from "~/lib/cn";
import {Link} from "@remix-run/react";

interface NavbarProps {
    ctaText: string;
    ctaOnClick: () => void;
    links: NavbarLinkProps[][];
}

const Navbar: React.FC<NavbarProps> = ({ctaText, links, ctaOnClick}) => {
    return (
        <header className="w-screen flex fixed bg-transparent mt-4 text-sm">
            <div
                className="max-w-7xl mx-auto pl-4 pr-2 sm:px-4 lg:px-6 rounded-3xl border bg-background/75 backdrop-blur-3xl">
                <div
                    className="flex justify-between items-center py-1 space-x-2 sm:space-x-8 md:space-x-12">
                    {
                        links.map((nested, idx) =>
                            <div
                                key={idx}
                                className="flex justify-between items-center space-x-4 md:space-x-8">
                                {nested.map(link =>
                                    <NavbarLink key={link.text}
                                                text={link.text}
                                                href={link.href}
                                                className={link.className}/>)}
                            </div>
                        )
                    }

                    <div className="flex items-center space-x-4">
                        <Button type={"submit"} size="sm"
                                className="w-full sm:w-auto px-4 font-bold"
                                onClick={ctaOnClick}>
                            {ctaText}
                            <ArrowRight className="ml-1 h-4 w-6"/>
                        </Button>
                    </div>

                    <BurgerMenu items={links}/>
                </div>
            </div>
        </header>
    );
};

export interface NavbarLinkProps {
    text: string
    href: string
    className?: string
    onClick?: MouseEventHandler
}

const NavbarLink: React.FC<NavbarLinkProps> = ({text, href, className, onClick}) => {
    return (
        <nav className={className} onClick={onClick}>
            <Link
                children={text}
                to={{hash: href}}
                className="text-secondary-foreground/70 hover:text-secondary-foreground"/>
        </nav>
    )
}

interface BurgerMenuProps {
    items: NavbarLinkProps[][];
}

const BurgerMenu: React.FC<BurgerMenuProps> = ({items}) => {
    return (
        <NavigationMenu className="md:hidden">
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger><Menu/></NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] lg:w-[600px] ">
                            {items
                                .flatMap(c => c)
                                .map((c) => (
                                    <NavigationListItem
                                        key={c.text}
                                        title={c.text}
                                        href={c.href}
                                        onClick={c.onClick}
                                    />
                                ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}

const NavigationListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({className, title, children, ...props}, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})

export default Navbar;