import styles from "./second_page.module.scss";

export default function Footer(){
    return(
        <footer id="contacts">
    		<div className={styles.footerContainer}>
      			<div className={styles.footerColumn}>
        		<h2>Music For Everyone</h2>
        		<p>Слушай что угодно, где угодно, как угодно</p>
      		</div>
      		<div className={styles.footerColumn}>
        		<h2>Почта</h2>
        		<p>info@yourmail.com</p>
      		</div>
      		<div className={styles.footerColumn}>
        		<h2>Связь с нами</h2>
        		<p>+79200000000</p>
      		</div>
      		<div className={styles.footerColumn}>
        		<h2>Telegram</h2>
        		<p>@Music_for_everybody_bot</p>
      		</div>
    		</div>
  		</footer>    
    )
}