import React, { createContext, useContext, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

interface ApiV1 {
  datasets: {
    list: () => Promise<any>;
    create: (name: string, type: string) => Promise<any>;
    get: (id: string) => Promise<any>;
    delete: (id: string) => Promise<any>;
    infos: (id:string) => Promise<any>;
    uploadData: (id:string, data: File) => Promise<any>;
  },
  models: {
    list: () => Promise<any>;
    create: (name: string, 
          kind: string, 
          task: string, 
          trainingHyperparameters: object, 
          training_dataset_id: number, 
          description: string, 
          derived_from_id: number) => Promise<any>;
    getTrainingOptions: (name: string) => Promise<any>;
    get: (id: string) => Promise<any>;
  }
}


const APIContext = createContext<{url: string, setUrl: (url: string) => void, api: ApiV1}>(null as unknown as {url: string, api: ApiV1, setUrl: (url: string) => void});
const API_BASE_URL = 'http://localhost:8000';


export const APIProvider = ({ children }: { children: React.ReactNode}) => {
  const { user } = useAuth()
  const [URL, setUrl] = useState(API_BASE_URL)

  const fetchData = async (endpoint: string, options = {}) => {
    try {
      const url = `${URL}/${endpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Include any necessary headers, like Authorization tokens
          'Authorization': `Bearer ${user.token}`,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (error) {
      console.error('API Fetch Error:', error);
      throw error;
    }
  };

  // Function to perform a POST request (can be adapted for PUT/DELETE)
  const postData = async (endpoint: string, data: any, options = {}) => {
    try {
      const url = `${URL}/${endpoint}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(data),
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (error) {
      console.error('API Post Error:', error);
      throw error;
    }
  };

  // Memoize the API object to prevent unnecessary re-renders in consumers
  const api = useMemo(() => ({
      datasets: {
        list: () => fetchData('datasets'),
        create: (name: string, type: string) => postData('datasets', {name, type}, { method: 'POST' }),
        get: (id: string) => fetchData(`datasets/${id}`),
        delete: (id: string) => fetchData(`datasets/${id}`, { method: 'DELETE' }),
        infos: (id:string) => fetchData(`datasets/${id}/infos`),
        uploadData: (id:string, data: File) => postData(`datasets/${id}/upload`, data, { method: 'PUT' }),
      },
      models: {
        list: () => fetchData('models'),
        create: (
          name: string, 
          kind: string, 
          task: string, 
          trainingHyperparameters: 
          object, training_dataset_id: 
          number, 
          description: string, 
          derived_from_id: number) => postData('models', { name, kind, task, trainingHyperparameters, training_dataset_id, description, derived_from_id }, { method: 'POST' }),
        getTrainingOptions: (name:string) => fetchData(`models/training_options/${name}`),
        get: (id: string) => fetchData(`models/${id}`),
      }
  }), [user.token, URL]);

  return (
    <APIContext.Provider value={{url: URL, setUrl, api}}>
      {children}
    </APIContext.Provider>
  );
};

export const useAPI = () => {
  const context = useContext(APIContext);
  if (context === undefined) {
    throw new Error('useAPI must be used within an APIProvider');
  }
  return context;
};