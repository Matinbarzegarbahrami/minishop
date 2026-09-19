import Footer from "@/src/components/footer/Footer";
import { ReactNode } from "react";

export default function Layout({children}:{children:ReactNode}){
  return(
    <>
    {children}
    <Footer />
    </>
  )
}