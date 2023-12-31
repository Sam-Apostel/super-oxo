import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { PropsWithChildren } from 'react';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Super 0x0',
	description: 'A higher dimensional oxo game',
}

export default function RootLayout({
	children,
}: PropsWithChildren) {
	return (
		<html lang="en">
		<body className={inter.className}>{children}</body>
		</html>
	)
}
