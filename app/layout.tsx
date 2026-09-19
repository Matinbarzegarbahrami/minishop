import style from "./style.module.css"
import "./globals.css";
export default function root({ children }: { children: React.ReactNode; }) {
    return (
        <html lang="fa" dir="rtl">
            <body className={style.root}>

                <div className={style.body}>
                    {children}
                </div>
            </body>
            
        </html>
    );
}