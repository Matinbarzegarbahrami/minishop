import { create } from "zustand"
import { persist } from "zustand/middleware";
import {initialT, userStoreT} from "./types";
const initial:initialT = {
  name:"",
  phone:"",
  cart:[]
}

const userStore = create<userStoreT>()(
  persist((set)=>({
    initial,
    setUser: (state)=>set({initial:state}),
    setInit: ()=>set({initial})
  }),
{
  name:"user"
})
)

export default userStore