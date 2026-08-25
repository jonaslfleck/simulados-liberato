import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:"Simulados Liberato",description:"Treine com provas anteriores da Fundação Liberato"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}