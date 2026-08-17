import { AppHeader } from "@/components/app-header"
import type { Profile } from "@/lib/types"
export function AdminHeader({ profile }: { profile: Profile }) { return <AppHeader profile={profile} nav={[{href:"/admin",label:"Dashboard"},{href:"/admin/exams",label:"Exams"},{href:"/admin/questions",label:"Questions"},{href:"/admin/results",label:"Results"}]} /> }
