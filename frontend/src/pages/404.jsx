import robotImage from '../assets/404robot.png'

export default () => {
  return <div className="columns-2 h-full flex justify-center items-center">
    <div className="flex flex-col h-full justify-center items-center w-100 bg-white p-8  text-center transition-all duration-300 transform">
      <p className="text-7xl md:text-8xl font-extrabold text-gray-800 mb-4 tracking-tighter">404</p>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Oops, this page <span className="text-indigo-600">doesn't exist yet</span>.
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        You've ventured into the digital void! Why don't you <span className="font-semibold">come to create it</span>?
        We love fresh ideas and new contributions.
      </p>
      <a href="https://github.com/andrea-alfonsi/model-forge" target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.05] focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 group">
          <svg className="w-5 h-5 mr-2 -ml-1 text-white group-hover:text-gray-100 transition" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2.0 0 .15.21.55.15C13.71 14.53 16 11.53 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          Explore our GitHub Projects
      </a>
    </div>
    <div className="flex flex-col h-full justify-center items-center w-100 bg-white text-center transition-all duration-300 transform">
      <img src={robotImage} alt='404 Error Illustration'/>
    </div>
  </div>
}