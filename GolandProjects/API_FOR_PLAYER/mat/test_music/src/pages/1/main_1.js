import { useState } from "react";
import styles from './demo_1.module.scss';
import { useNavigate } from "react-router-dom";


export default function Main() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const login = (data) => setUser(data);



  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
  login(data);              // сохраняем пользователя в состоянии
  navigate("/second", { state: { user: data } });     // переходим на вторую страницу
  alert("✅ Вход выполнен! Добро пожаловать, " + data.username);
  setUsername("");
  setEmail("");
  setPassword("");
} else {
        alert("Ошибка входа: " + data.error);
      }
    } catch (error) {
      console.error("Ошибка при входе:", error);
      alert("Не удалось выполнить вход");
    }
  };

    
  const handleRegister = async (e) => {
  e.preventDefault();

  if (!username.trim() || !password.trim()) {
    alert("Введите имя и пароль");
    return;
  }

  try {
    const response = await fetch("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // ✅ вот здесь вставляем мой пункт
      login(data);   // сохраняем id пользователя
      navigate("/second", { state: { user: data } });                       // переходим на вторую страницу

      alert("✅ Пользователь создан! ID: " + data.id);
      setUsername("");
      setEmail("");
      setPassword("");
    } else {
      alert("Ошибка: " + data.error);
    }
  } catch (error) {
    console.error("Ошибка при создании пользователя:", error);
    alert("Не удалось создать пользователя");
  }
};

  return (
    <>
      <section className={styles.info}>
        <h1>Музыка для всех</h1>
        <div className={styles.box}>
          <ul className={styles['features-list']}>
            <li>
              Хотите послушать зарубежные треки, которых нет в доступных сервисах? Тогда вы по адресу!
            </li>
            <li>У нас есть как свежие треки, так и классика самых разных жанров</li>
            <li>
              За скромную стоимость вы получаете доступ к огромной библиотеке зарубежных треков, которая постоянно обновляется
            </li>
          </ul>
          <img src="images/Travis.png" alt="Travis_Scott" />
        </div>
        <a href="#services" className={styles['cta-button']}>Оформить подписку</a>
      </section>

      <section className={styles.services} id="services">
        <h2>Услуги</h2>
        <div className={styles.values}>
          <div className={styles.sub}>
            <img src="images/kanye.png" alt="Kanye" />
            <div className={styles['pricing-card']}>
              <h3>Стандартная подписка</h3>
              <div className={styles.price}>
                1$<span>/месяц</span>
              </div>
              <label htmlFor="form-toggle" className={styles['service-button']}>Оформить стандарт</label>
            </div>
          </div>

          <div className={styles.sub}>
            <div className={styles.reverse_photo}>
              <div className={styles['pricing-card']}>
                <h3>Премиум подписка</h3>
                <div className={styles.price}>
                  2.5$<span>/месяц</span>
                </div>
                <label htmlFor="form-toggle" className={styles['service-button']}>Оформить премиум</label>
              </div>
              <img src="images/freddie_dreddie.jpg" alt="Freddie Dreddie" />
            </div>
          </div>
        </div>

        <input type="checkbox" id="form-toggle" hidden />

        <div className={styles['modal-form']}>
          <div className={styles['form-container']}>
            <label htmlFor="form-toggle" className={styles['close-button']}>&times;</label>
            
            <div className={styles['toggle-auth']}>
  <button
    type="button"
    className={styles['service-button']}
    onClick={() => setIsLoginMode(!isLoginMode)}
  >
    {isLoginMode ? "Перейти к регистрации" : "Уже есть аккаунт? Войти"}
  </button>
</div>

            <h2>{isLoginMode ? "Вход" : "Регистрация пользователя"}</h2>
<form
  className={styles['form-design']}
  onSubmit={isLoginMode ? handleLogin : handleRegister}
>
  <label>
    Имя
    <input
      type="text"
      placeholder="Введите ваше имя"
      value={isLoginMode ? loginUsername : username}
      onChange={(e) =>
        isLoginMode
          ? setLoginUsername(e.target.value)
          : setUsername(e.target.value)
      }
    />
  </label>

  {!isLoginMode && (
    <label>
      Email
      <input
        type="email"
        placeholder="Введите ваш email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </label>
  )}

  <label>
    Пароль
    <input
      type="password"
      placeholder="Введите пароль"
      value={isLoginMode ? loginPassword : password}
      onChange={(e) =>
        isLoginMode
          ? setLoginPassword(e.target.value)
          : setPassword(e.target.value)
      }
    />
  </label>

  <button type="submit" className={styles['service-button']}>
    {isLoginMode ? "Войти" : "Создать пользователя"}
  </button>
</form>
          </div>
          
        </div>
       
      </section>
    </>
  );
}
