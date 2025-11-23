import { RouterProvider } from "@tanstack/react-router"
import { router } from "./routes"
import { AuthProvider } from "./contexts/AuthContext"
import { VersionProvider } from "./contexts/VersionContext"
import { SettingsProvider } from "./contexts/SettingsContext"
import { APIProvider } from "./contexts/ApiContext"


export default function App() {
  return (
    <VersionProvider>
      <AuthProvider>
        <APIProvider>
          <SettingsProvider>
            <RouterProvider router={router} />      
          </SettingsProvider>
        </APIProvider>
      </AuthProvider>
    </VersionProvider>
  )
}
