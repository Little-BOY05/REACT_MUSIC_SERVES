import { useState, useEffect } from "react";
import styles from "./second_page.module.scss";

export default function Header({
  user,
  playlists,
  setPlaylists,
  setSelectedPlaylistId
}) {
  const [isopenplaylists, setisopenplaylists] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const userId = user?.id || null;


  // Загружаем плейлисты пользователя (динамический userId)
  useEffect(() => {
    if (!userId) {
      setPlaylists([]); // если нет userId — сбрасываем список
      return;
    }

    fetch(`/users/${userId}/playlists`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error("Ответ не JSON");
        }
        return res.json();
      })
      .then((data) => setPlaylists(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Ошибка загрузки плейлистов:", err);
        setPlaylists([]); // защита от undefined
      });
  }, [userId, setPlaylists]);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("Сначала создайте или выберите пользователя");
      return;
    }
    if (!newPlaylistName.trim()) {
      alert("Введите название плейлиста");
      return;
    }

    try {
      const response = await fetch("/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          name: newPlaylistName,
          description: "Кастомный плейлист",
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await response.json() : null;

      if (response.ok && data && typeof data.id === "number") {
        setPlaylists((prev) => [...(Array.isArray(prev) ? prev : []), { id: data.id, name: newPlaylistName }]);
        setNewPlaylistName("");
        setIsCreating(false);
        alert("Плейлист создан!");
      } else {
        const msg = data?.error || `Ошибка создания плейлиста (HTTP ${response.status})`;
        alert(msg);
      }
    } catch (error) {
      console.error("Ошибка при создании плейлиста:", error);
      alert("Не удалось создать плейлист");
    }
  };

  const handleSelectPlaylist = (playlist) => {
    if (!playlist?.id) return;
    setSelectedPlaylistId(playlist.id);
    setisopenplaylists(false);
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav_1}>
        <img src="./images/logo.png" alt="logo" />
        <ul>
          <li>
            <a href="/" className={styles.comeback}>Вернуться на главную</a>
          </li>
          <li className={styles.playlistWrapper}>
            <a
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                setisopenplaylists(!isopenplaylists);
              }}
            >
              Плейлисты
            </a>
            {isopenplaylists && (
              <div className={styles.playlistPopup}>
                <div className={styles.playlistHeader}>
                  <button onClick={() => setisopenplaylists(false)}>✖</button>
                </div>

                <div className={styles.playlistList}>
                  {!isCreating ? (
                    <a className={styles.createBtn} onClick={() => setIsCreating(true)}>Создать +</a>
                  ) : (
                    <form className={styles.createForm} onSubmit={handleCreatePlaylist}>
                      <input
                        type="text"
                        placeholder="Название плейлиста"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        autoFocus
                      />
                      <button id="Create" type="submit">Создать</button>
                      <a id="Create_btn" type="button" onClick={() => setIsCreating(false)}>Отмена</a>
                    </form>
                  )}

                  {Array.isArray(playlists) && playlists.length > 0 ? (
                    playlists.map((pl) => (
                      <div
                        key={pl.id}
                        className={styles.playlistItem}
                        onClick={() => handleSelectPlaylist(pl)}
                      >
                        {pl.name}
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyInfo}>
                      {userId ? "Плейлистов пока нет" : "Нет выбранного пользователя"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </li>
          <li>
            <a href="/third" className="nav-link">Поиск</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
