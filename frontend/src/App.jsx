import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import ProjectTable from './pages/ProjectTable'
import NewProject from './pages/NewProject'
import Page404 from './pages/404'
import Navbar from './navbar'
import Sidebar, { SidebarItem } from './sidebar'
import { BackendProvider } from './contexts/backend';
import { LayoutProvider } from './contexts/layout'


const ProjectsIcon = () => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="w-5 h-5 text-violet-400" aria-hidden="true"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path></svg>
}
const DatasetsIcon = () => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="w-5 h-5 text-violet-400">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="7" y1="7" x2="17" y2="7"></line>
    <line x1="7" y1="12" x2="17" y2="12"></line>
    <line x1="7" y1="17" x2="17" y2="17"></line>
  </svg>
}

const ModelsIcon = () => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="w-5 h-5 text-violet-400">
    <circle cx="12" cy="5" r="3"></circle>
    <circle cx="19" cy="12" r="3"></circle>
    <circle cx="5" cy="12" r="3"></circle>
    <circle cx="12" cy="19" r="3"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="7" y1="12" x2="17" y2="12"></line>
    <line x1="7.4" y1="7.4" x2="16.6" y2="16.6"></line>
    <line x1="16.6" y1="7.4" x2="7.4" y2="16.6"></line>
  </svg>
}

const JobsIcons = () => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"  className="w-5 h-5 text-violet-400">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
}

export default function App(){
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);


  return <>
    <BackendProvider>
      <LayoutProvider value={{ isSidebarOpen }}>
        <Navbar
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        ></Navbar>
        <div className="flex flex-1 pt-16 h-screen overflow-hidden">
          <Sidebar>
            <SidebarItem icon={<ProjectsIcon />} text={"Projects"}  />
            <SidebarItem icon={<DatasetsIcon />} text={"Datasets"} />
            <SidebarItem icon={<ModelsIcon />} text={"Models"} />
            <SidebarItem icon={<JobsIcons />} text={"Jobs"} />
          </Sidebar>
          <main
            className="flex-1 overflow-y-auto bg-gray-50 transition-all duration-300"
          >
            <BrowserRouter>
              <Routes>
                <Route index element={<ProjectTable />} />
                <Route path ="/new-project" element={<NewProject />} />
                <Route path="*" element={<Page404 />} />
              </Routes>
            </BrowserRouter>
          </main>
        </div>
      </LayoutProvider>
    </BackendProvider>
  </>
}