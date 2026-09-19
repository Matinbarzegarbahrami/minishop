import style from "@/app/style.module.css";
export default function Footer() {
  return (
    <>
      <footer>
        <div className={style.footerbox}>
          <div className={style.footertexes}>
            <p className={style.supporttext}>پشتیبانی</p>
            <div>
              <p>شماره تماس : <a href="tel:09123456789">09123456789</a></p>
              <p>ساعت فعالیت : 11:00 الی 21:00 هر روز</p>
              <p>آدرس : تهران, ونک</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}