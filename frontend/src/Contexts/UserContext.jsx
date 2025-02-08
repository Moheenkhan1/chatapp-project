import { createContext, useContext, useState } from 'react';

export const UserDataContext = createContext();

const UserContext = ({children})=>{

    const [user, setUser] = useState({})

    console.log("auth user testing",user)

    return (
        <UserDataContext.Provider value={{user,setUser}}>
            {children}
        </UserDataContext.Provider>
    )


}
export default UserContext;

