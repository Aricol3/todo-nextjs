"use client";

import {useTheme} from "next-themes";
import {useEffect, useState} from "react";
import {Switch} from "@nextui-org/react";
import {SunIcon} from "./SunIcon";
import {MoonIcon} from "./MoonIcon";

export const ThemeSwitcher = ({selectedColor}) => {
    const [mounted, setMounted] = useState(false)
    const {theme, setTheme} = useTheme()
    const [isSelected, setIsSelected] = useState(theme === "dark");
    console.log(theme)
    console.log(isSelected)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <Switch size="lg" color={selectedColor} isSelected={isSelected}
                onValueChange={() => {
                    isSelected ? setTheme("light") : setTheme("dark");
                    setIsSelected(!isSelected);
                }}
                thumbIcon={({isSelected, className}) =>
                    isSelected ? (
                        <SunIcon className={className}/>
                    ) : (
                        <MoonIcon className={className}/>
                    )
                }>
        </Switch>
    )
};