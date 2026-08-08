import Link from "next/link"
import { WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
export default function OfflinePage(){return <main className="flex min-h-svh items-center justify-center bg-muted/30 px-4"><div className="max-w-md text-center"><WifiOff className="mx-auto h-12 w-12 text-muted-foreground"/><h1 className="mt-4 font-display text-2xl font-bold">You’re offline</h1><p className="mt-2 text-muted-foreground">Reconnect to the internet and try again. Exam submissions always require a live connection.</p><Button className="mt-6" asChild><Link href="/">Return home</Link></Button></div></main>}
