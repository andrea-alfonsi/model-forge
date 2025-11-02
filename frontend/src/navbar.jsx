import { useBackend } from "./contexts/backend"
import { useState } from "react";

export default () => {

  const { reset, isSetupComplete } = useBackend()
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirmReset = () => {
        reset();
        setIsModalOpen(false);
    };

  return <nav
      className="px-4 py-2 flex justify-between items-center bg-white dark:bg-gray-800 border-b-2 dark:border-gray-600 sticky top-0"
      style={{marginLeft: 68,width: 'calc( 100% - 68px )'}}>

      <a className="text-2xl font-bold text-violet-600 dark:text-white" href="#">
          ModelForge
      </a>

      <ul
          className="hidden absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 lg:mx-auto lg:flex lg:items-center lg:w-auto lg:space-x-6">
          <li>
              <div className=" relative mx-auto text-gray-600">
                  <input className="border border-gray-300 placeholder-current h-10 px-5 pr-16  rounded-lg text-sm focus:outline-none dark:bg-gray-500 dark:border-gray-50 dark:text-gray-200 " type="search" name="search" placeholder="Search" />

                  <button type="submit" className="absolute right-0 top-0 mt-3 mr-4">
                          <svg className="text-gray-600 dark:text-gray-200 h-4 w-4 fill-current"
                              xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1"
                              x="0px" y="0px" viewBox="0 0 56.966 56.966"
                              xmlSpace="preserve" width="512px" height="512px">
                              <path
                                  d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" />
                          </svg>
                  </button>

              </div>
          </li>
      </ul>


      <div className="flex">
          <div>
              <button 
                className=" py-1.5 px-3 m-1 text-center bg-gray-100 border border-gray-300 rounded-md text-black  hover:bg-gray-100 dark:text-gray-300 dark:bg-gray-700 inline-block"
                onClick={() => setIsModalOpen(true)}
              >
                  Settings
              </button>
          </div>

      </div>

      <ResetConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirmReset={handleConfirmReset}></ResetConfirmationModal>

  </nav>
}

const ResetConfirmationModal = ({ isOpen, onClose, onConfirmReset }) => {
    if (!isOpen) return null;

    return (
        // Modal Backdrop
        <div className="fixed inset-0 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4" onClick={onClose}
           style={{zIndex: 100}}>
            {/* Modal Content */}
            <div 
                className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 transform transition-all duration-300 scale-100 opacity-100" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center border-b pb-4 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.341c.532-1.025 2.217-1.025 2.749 0l1.842 3.54a1.002 1.002 0 01-.179.91l-1.63 1.583a1 1 0 00.323 1.637l1.587.89c.744.418 1.036 1.343.717 2.155l-.89 1.588a1 1 0 01-1.637.322l-1.583-1.63a1.002 1.002 0 00-.91-.179l-3.54 1.842c-1.025.532-2.316-.27-2.155-1.732l.89-1.588a1 1 0 011.637-.322l1.583 1.63a1.002 1.002 0 00.91.179l3.54-1.842c1.025-.532 2.316.27 2.155 1.732l-.89 1.588a1 1 0 01-1.637.322l-1.583-1.63a1.002 1.002 0 00-.91-.179l-3.54 1.842c-1.025.532-2.316-.27-2.155-1.732l-.89-1.588a1 1 0 011.637-.322l1.583 1.63a1.002 1.002 0 00.91-.179z" clipRule="evenodd" />
                    </svg>
                    <h2 className="text-xl font-bold text-gray-900">Confirm Reset</h2>
                </div>

                <p className="text-gray-700 mb-6">
                    This action will **clear the current project setup** and force you back to the initial input form. Are you absolutely sure you want to proceed?
                </p>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg font-medium hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirmReset}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition shadow-md"
                    >
                        Yes, Clear Setup
                    </button>
                </div>
            </div>
        </div>
    );
};