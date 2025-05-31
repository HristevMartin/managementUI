// import { useState, useEffect } from "react";

// export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
//     const [storedValue, setStoredValue] = useState<T>(initialValue);

//     useEffect(() => {
//         try {
//             const item = window.localStorage.getItem(key);
//             if (item !== null) {
//                 setStoredValue(JSON.parse(item) as T);
//             }
//         } catch (error) {
//             console.log('Error reading localStorage key "', key, '":', error);
//         }
//     }, [key]);

//     const setValue = (value: T | ((val: T) => T)) => {
//         try {
//             const valueToStore = value instanceof Function ? value(storedValue) : value;
//             setStoredValue(valueToStore);
//             window.localStorage.setItem(key, JSON.stringify(valueToStore));
//         } catch (error) {
//             console.log('Error saving to localStorage key "', key, '":', error);
//         }
//     };

//     return [storedValue, setValue];
// }

// export default useLocalStorage;

import {
  getUserStateToHttpOnlyCookie,
  saveUserStateToHttpOnlyCookie,
} from "@/services/get-from-cookies";
import { useState, useEffect } from "react";

export function useHttpOnlyCookies(key, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    const fetchCookie = async () => {
      try {
        const showMeTheUserState = await getUserStateToHttpOnlyCookie(
          initialValue
        );
        setStoredValue(showMeTheUserState);
      } catch (error) {
        console.error("Error fetching cookie:", error);
      }
    };

    fetchCookie();
  }, [key]);

  const setValue = (value) => {
    setStoredValue(value);
    console.log("this is being called now...", value);
    saveUserStateToHttpOnlyCookie(value);
  };

  return [storedValue, setValue];
}

export default useHttpOnlyCookies;
