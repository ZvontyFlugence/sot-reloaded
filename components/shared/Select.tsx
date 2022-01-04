import { Box } from '@chakra-ui/layout'
import React, { useEffect, useMemo, useState } from 'react'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'

interface SelectComponent {
    className?: string
    selected: number
    onChange: (value: number) => void
}

interface OptionComponent {
    value: number
    onClick?: () => void
    disabled?: boolean
}

interface SelectOptions {
    Option: React.FC<OptionComponent>
}

const Select: React.FC<SelectComponent> & SelectOptions = ({ children, ...props }) => {
    const [open, setOpen] = useState<boolean>(false)
    const [selectedValue, setSelectedValue] = useState<number>(findSelected(props.selected)?.props?.value)
    const [selectedText, setSelectedText] = useState<React.ReactNode>(findSelected(props.selected)?.props?.children)

    function findSelected(value: number) {
        return (children as React.ReactElement[]).find((child: React.ReactElement) => {
            return child?.props?.value === value
        })
    }

    const handleSelect = (e: MouseEvent, value: number, text: React.ReactNode) => {
        e.preventDefault()

        setSelectedValue(value)
        setSelectedText(text)
        setOpen(false)
    }

    const windowClickListener = useMemo(() => { return function (this: Window, ev: MouseEvent) { setOpen(false) } }, [setOpen])

    useEffect(() => {
        props.onChange(selectedValue)
    }, [selectedValue])

    useEffect(() => {
        if (open) {
            window.addEventListener('click', windowClickListener)
        } else {
            window.removeEventListener('click', windowClickListener)
        }
    }, [open])

    return (
        <div className={`${props.className}`}>
            <Box bg='night.400' className='flex justify-between items-center rounded py-2 px-4 cursor-pointer' onClick={() => setOpen(prev => !prev)}>
                <div className='flex gap-2'>
                    {selectedText}
                </div>
                <span className='ml-4'>
                    {open ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </span>
            </Box>
            {open && (
                <Box bg='night.400' className='absolute top-12 w-max max-h-64 rounded overflow-x-hidden overflow-y-auto shadow z-50'>
                    {React.Children.map(children as React.ReactElement[], (child: React.ReactElement) => {
                        return !child?.props?.disabled ? (
                            <Select.Option onClick={(e: MouseEvent) => handleSelect(e, child?.props?.value, child?.props?.children)} {...child?.props} />
                        ) : (
                            <Select.Option className='px-2 py-1' {...child?.props} />
                        )
                    })}
                </Box>
            )}
        </div>
    )
}

const Option: React.FC<OptionComponent> = ({ children, onClick, ...props}) => (
    <Box
        bg={props.disabled ? 'night.200' : 'night.400'}
        _hover={{ bg: !props.disabled && 'frost.100' }}
        className={`py-2 px-4 ${props.disabled ? '': 'cursor-pointer'}`}
        onClick={onClick}
        {...props}
    >
        {children}
    </Box>
)
Select.Option = Option

export default Select
