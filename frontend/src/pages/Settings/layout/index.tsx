import { Outlet } from "@tanstack/react-router";

export default function SettingsLayout() {
    return (
        <div>
            <h1>Settings</h1>
            <Outlet />
        </div>
    )
}