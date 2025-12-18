import styles from './third_page.module.scss';


export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav_2}>
        <img src="images/logo.png" alt="logo" />
        <ul>
          <li><a href="/" className={styles.comeback_2}>Вернуться на главную</a></li>
          <li><a href="/second" className={styles.comeback_2}>Вернуться к плееру</a></li>
        </ul>
      </nav>
    </header>
  );
}