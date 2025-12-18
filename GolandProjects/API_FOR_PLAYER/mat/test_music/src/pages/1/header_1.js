import styles from './demo_1.module.scss';


export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav_0}>
        <img src="images/logo.png" alt="logo" />
        <ul>
          <li><a href="#" className={styles.navLink}>info</a></li>
          <li><a href="/second" className={styles.navLink}>Плеер</a></li>
          <li><a href="#services" className={styles.navLink}>Услуги</a></li>
          <li><a href="#contacts" className={styles.navLink}>Контакты</a></li>
        </ul>
      </nav>
    </header>
  );
}