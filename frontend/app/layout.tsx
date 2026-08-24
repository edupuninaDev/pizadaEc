import type { Metadata } from 'next';
import "./global.css";

export const metadata: Metadata = {
    title: 'PizadaEc',
    description: 'Tienda online de calzado',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body>{children}</body>
        </html>
    );
}