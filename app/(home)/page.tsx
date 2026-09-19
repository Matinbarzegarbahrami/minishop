import Header from "@/src/components/header/page"
import Carousel from "@/src/components/Carousel/page";
import style from "./style.module.css";

const URL = process.env.BASE_URL || "http://localhost:3000"

export default async function home() {


  let products: any = [];
  let tShirts: any = [];
  let pants: any = [];

  // {
  //     try {
  //         const data = await fetch(`${URL}/api/products/`, {
  //             method: "GET",
  //             cache: "no-store"
  //         });
  //         if (!data.ok) {
  //             throw new Error("cant catch data");
  //         }
  //         const res = await data.json();


  //         products = res;
  //     } catch (error) {
  //         console.error("API ERROR:", error);
  //     }
  // }
  // // T-shirts
  // {
  //     try {
  //         const data = await fetch(`${URL}/api/T-shirts/`, {
  //             method: "GET",
  //             cache: "no-store"
  //         });
  //         if (!data.ok) {
  //             throw new Error("cant catch data");
  //         }
  //         const res = await data.json();


  //         tShirts = res;
  //     } catch (error) {
  //         console.error("API ERROR:", error);
  //     }
  // }
  // // pants
  // {
  //     try {
  //         const data = await fetch(`${URL}/api/pants/`, {
  //             method: "GET",
  //             cache: "no-store"
  //         });
  //         if (!data.ok) {
  //             throw new Error("cant catch data");
  //         }
  //         const res = await data.json();


  //         pants = res;
  //     } catch (error) {
  //         console.error("API ERROR:", error);
  //     }
  // }


  return (
    <div>
      <div>
        <Header />
      </div>
      <div className={style.main}>
        <div>
          {/* special offer */}
          <div className={style.offerTextBox}>
            <a className={style.offerText} href="#">فروش ویژه</a>
          </div>
          <div className={style.menuBox}>
            <Carousel products={products} />
          </div>

          {/* T-Shirt */}
          <div className={style.offerTextBox}>
            <a className={style.offerText} href="#"> تی شرت</a>
          </div>
          <div className={style.menuBox}>
            <Carousel products={tShirts} />
          </div>

          {/* pants */}
          <div className={style.offerTextBox}>
            <a className={style.offerText} href="#">شلوار</a>
          </div>
          <div className={style.menuBox}>
            <Carousel products={pants} />
          </div>

        </div>
      </div>
    </div>
  )
}