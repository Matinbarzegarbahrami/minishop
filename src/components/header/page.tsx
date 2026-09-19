import style from "./style.module.css";
import NavBar from "./Navbar";

export default function Header() {
  

  return (
    <header className={style.header}>
      {/* دکمه باز/بستن منو */}
      

      <a href="#" className="text-3xl font-bold "><h1 className="text-[#a546a0]">mimishop</h1></a>
      <NavBar/>
    </header>
  );
}
