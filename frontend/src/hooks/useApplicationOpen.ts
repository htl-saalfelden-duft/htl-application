import { useEffect, useMemo, useState } from "react"
import { ApiService } from "../services/api.service"
import { Setting } from "../models/setting.model"

// Whether the online application is unlocked (toggled by admins on /settings).
// undefined while loading.
const useApplicationOpen = () => {
    const apiService = useMemo(() => new ApiService(), [])
    const [applicationOpen, setApplicationOpen] = useState<boolean>()

    useEffect(() => {
        apiService.getPath<Setting>(Setting, 'applicationOpen')
            .then(setting => setApplicationOpen(setting.value))
    }, [apiService])

    return applicationOpen
}

export default useApplicationOpen
