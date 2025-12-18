import styles from './demo_1.module.scss';

export default function Footer() {
  return (
    <footer id="contacts">
      <div className={styles['footer-container']}>
        <div className={styles['footer-column']}>
          <h2>Music For Everyone</h2>
          <p>Слушай что угодно, где угодно, как угодно</p>
        </div>

        <div className={styles['footer-column']}>
          <h2>Почта</h2>
          <p>info@yourmail.com</p>
        </div>

        <div className={styles['footer-column']}>
          <h2>Связь с нами</h2>
          <p>+79200000000</p>
        </div>

        <div className={styles['footer-column']}>
          <h2>Telegram</h2>
          <a href="https://t.me/music_f0r_every_0ne">Music_for_everybody</a>
        </div>
      </div>

      <img src="images/logo.png" alt="logo" />
    </footer>
  );
}
