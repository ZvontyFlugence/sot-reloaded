export default function showToast(
	toastFn: any,
	status: string,
	title: string,
	msg?: string
) {
	toastFn({
		position: 'top-right',
		title,
		description: msg,
		status,
		duration: 2500,
		isClosable: true,
	})
}
