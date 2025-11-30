import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from '@tanstack/react-router'

import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import Datasets from "@/pages/Datasets"
import Models from "@/pages/Models"
import Index from "@/pages/Index"
import Settings from "@/pages/Settings"
import newModel from "@/pages/Models/newModel"
import Playground,{PickModelPage} from "@/pages/Models/playground"


const rootRoute = createRootRoute({
  component: () => (
    <>
      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset>
              <div className="flex flex-1 flex-col gap-4 p-4">
                <Outlet />
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
      <TanStackRouterDevtools />
    </>
  ),
  notFoundComponent:() => <p>Page not found</p>
})

const datasetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/datasets',
  component: () => <Datasets />,
})

const modelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/models',
  component: () => <Outlet />
})
const indexModelRoute = createRoute({
  getParentRoute: () => modelsRoute,
  path: '/',
  component: Models,
})
const newModelRoute = createRoute({
  getParentRoute: () => modelsRoute,
  path: '/new-model',
  component: newModel,
})
const playgroundRoute = createRoute({
  getParentRoute: () => modelsRoute,
  path: '/playground/$model',
  component: () => <Playground />,
})
const playgroundModelPickerRoute = createRoute({
  getParentRoute: () => modelsRoute,
  path: '/playground',
  component: () => <PickModelPage />,
})


const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => <Settings />,
})

const genericPagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Index />,
})


const routeTree = rootRoute.addChildren([datasetsRoute, modelsRoute.addChildren([newModelRoute, playgroundRoute, playgroundModelPickerRoute, indexModelRoute]), settingsRoute, genericPagesRoute])
export const router = createRouter({ routeTree, basepath: '/v1.0' })

// Register types (so that the router works with TS without crutches)
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}