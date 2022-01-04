import { ITEMS } from '@/core/constants'
import { GenericItem } from '@/core/interfaces'
import React, { Dispatch, SetStateAction } from 'react'
import { Item, Menu, useContextMenu } from 'react-contexify'

interface InventoryProps {
	inventory: GenericItem[]
	onSellItem?: () => void
	setSelected?: Dispatch<SetStateAction<GenericItem>> | ((item: GenericItem) => void)
	displayOnly?: boolean
}

const Inventory: React.FC<InventoryProps> = ({ inventory, ...props }) => {
	const handleSellItem = (item: GenericItem) => {
		if (props.onSellItem && props.setSelected) {
			props.setSelected(item)
			props.onSellItem()
		}
	}

	const handleClick = (item: GenericItem) => {
		if (!props.onSellItem && props.setSelected) props.setSelected(item)
	}

	return !inventory || inventory.length === 0 ? (
		<p className='w-full'>There are no items in inventory</p>
	) : (
		<div className='grid grid-cols-3 md:grid-cols-8 rounded p-4'>
			{inventory.map((item, i) => (
				<InventoryItem
					key={item.id}
					item={item}
					index={i}
					onSellItem={props.onSellItem && (() => handleSellItem(item))}
					onClick={!props.onSellItem ? () => handleClick(item) : undefined}
					displayOnly={!props.displayOnly}
				/>
			))}
		</div>
	)
}

interface InvItemProps {
	item: GenericItem
	index: number
	onSellItem?: () => void
	onClick?: () => void
	displayOnly?: boolean
}

const InventoryItem: React.FC<InvItemProps> = ({ item, index, ...props }) => {
	const itemInfo = ITEMS[item.itemId]
	const { show, hideAll } = useContextMenu({ id: `item-${item.id}` })

	const wrappedClick = (clickFn?: () => void) => {
		if (clickFn) clickFn()
		hideAll()
	}

	return (
		<>
			<div
				className='relative w-full h-20 rounded border border-aurora-red shadow-md cursor-pointer'
				onContextMenu={!props.displayOnly ? show : undefined}
			>
				<div className='absolute -top-px right-0 h-6 px-1 pb-1 w-auto bg-aurora-red text-snow-100 rounded-tr border border-solid border-frost-400'>
					<span>{item.quantity}</span>
				</div>
				<div className='flex flex-col items-center justify-center mt-1'>
					<i className={itemInfo.image} style={{ zoom: itemInfo.quality > 0 ? '150%' : '175%' }} />
					<p>
						{itemInfo.quality > 0 && `Q${itemInfo.quality}`} {itemInfo.name}
					</p>
				</div>
			</div>

			<Menu id={`item-${item.id}`} theme='brand'>
				{props.onSellItem && <Item onClick={() => wrappedClick(props.onSellItem)}>Sell Item</Item>}
				{props.onClick && <Item onClick={() => wrappedClick(props.onClick)}>Select Item</Item>}
			</Menu>
		</>
	)
}

export default Inventory
