import {useState, useRef, useEffect} from "react";
import styles from "./second_page.module.scss";
import { useLocation} from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Main({ playlists = [], setPlaylists, selectedPlaylistId}) {
  const location = useLocation();
  const passedTrack = location.state?.track || null;
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId"); // <-- достаём id




  // Грузим плейлисты пользователя с сервера
  useEffect(() => {
    if (!userId) return;
    fetch(`/users/${userId}/playlists`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) throw new Error("Ответ не JSON");
        return res.json();
      })
      .then(data => setPlaylists(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Ошибка загрузки плейлистов:", err);
        setPlaylists([]); // защита от undefined
      });
  }, [userId, setPlaylists]);

  const [isOpen, setIsOpen] = useState(false);
  const [isplay, setisplay] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentTime, setcurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [isRepeat, setisRepeat] = useState(false);
  const [israndom, setisrandom] = useState(false);
  const [liked, setisliked] = useState(false);
  const [isopenLeft, setisopenLeft] = useState(false);
  const [isopenLeftmorehoriz, setisopenLeftmorehoriz] = useState(true);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [playlistSearch, setPlaylistSearch] = useState("");
	const [selectedPlaylist, setSelectedPlaylist] = useState(null);
	useEffect(() => {
    if (!selectedPlaylistId) return;
    const pl = playlists.find(p => p.id === selectedPlaylistId);
    if (!pl) return;

  fetch(`/playlists/${pl.id}/tracks`)
    .then(res => res.json())
    .then(tracks => setSelectedPlaylist({ ...pl, tracks: Array.isArray(tracks) ? tracks : [] }))
    .catch(err => console.error("Ошибка загрузки треков:", err));
  }, [selectedPlaylistId, playlists]);

  const audioRef = useRef(null);

  const matchesSearch = (track) =>
    track.name.toLowerCase().includes(playlistSearch.toLowerCase()) ||
    track.artist.toLowerCase().includes(playlistSearch.toLowerCase());

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleCanPlay = () => {
      if (isplay) audio.play().catch(err => console.log("Ошибка воспроизведения:", err));
    };
    audio.addEventListener("canplay", handleCanPlay);
    return () => audio.removeEventListener("canplay", handleCanPlay);
  }, [currentSong, isplay]);

	const findTrackPosition = (song) => {
  		if (!selectedPlaylist || !Array.isArray(selectedPlaylist.tracks)) return null;
  		const idx = selectedPlaylist.tracks.findIndex(t => t.id === song.id);
  		return idx !== -1 ? idx : null;
	};

const handleTrackClick = (track) => {
  setCurrentSong({
    ...track,
    albumId: track.albumId ?? track.album_id,
    artistId: track.artistId ?? track.artist_id,
    progress: 0,
    length: 0
  });
  setisplay(true);
};


useEffect(() => {
  if (passedTrack && passedTrack.id) {
    setCurrentSong({
      ...passedTrack,
      albumId: passedTrack.albumId ?? passedTrack.album_id,
      artistId: passedTrack.artistId ?? passedTrack.artist_id,
      progress: 0,
      length: 0
    });
    setisplay(true);
  }
}, [passedTrack]);


  const addTrackToPlaylist = async (playlistId, track) => {
    try {
      // если нет серверного эндпоинта — фронт не падает, просто лог
      const response = await fetch("/playlist_tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlist_id: playlistId, track_id: track.id })
      });

      if (!response.ok) {
        console.warn("Сервер не добавил трек (проверь /playlist_tracks)");
      }

      setPlaylists(prev =>
        (Array.isArray(prev) ? prev : []).map(pl =>
          pl.id === playlistId
            ? { ...pl, tracks: Array.isArray(pl.tracks) ? [...pl.tracks, track] : [track] }
            : pl
        )
      );
    } catch (err) {
      console.error("Ошибка добавления трека:", err);
    }
    setShowAddMenu(false);
  };

const toggleFavorite = async () => {
  // визуальное состояние сердца
  setisliked(prev => !prev);

  // защита: нужен текущий трек
  if (!currentSong || !currentSong.id) return;

  try {
    // 1) найти плейлист "Понравившиеся"
    let favorites = (Array.isArray(playlists) ? playlists : []).find(
      pl => pl.name === "Понравившиеся"
    );

    // 2) если нет — создать на бэке и добавить в стейт
    if (!favorites) {
      const rawUserId = localStorage.getItem("userId");
      const userId = rawUserId ? Number(rawUserId) : null;
      if (!userId) {
        console.warn("Нет userId в localStorage — не могу создать 'Понравившиеся'");
        return;
      }

      const resp = await fetch("/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          name: "Понравившиеся",
          description: "Автоматический плейлист"
        })
      });

      const data = await resp.json().catch(() => null);
      if (!resp.ok || !data || typeof data.id !== "number") {
        console.warn("Не удалось создать плейлист 'Понравившиеся'");
        return;
      }

      favorites = { id: data.id, name: "Понравившиеся", tracks: [] };
      setPlaylists(prev => [...(Array.isArray(prev) ? prev : []), favorites]);
    }

    // 3) не добавляем дубликаты
    const alreadyIn =
      Array.isArray(favorites.tracks) &&
      favorites.tracks.some(t => t.id === currentSong.id);
    if (alreadyIn) return;

    // 4) отправить линк на сервер
    await fetch("/playlist_tracks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playlist_id: favorites.id, track_id: currentSong.id })
    }).catch(() => { /* молча, чтобы UX не страдал */ });

    // 5) обновить локальный стейт — трек появился в "Понравившиеся"
    setPlaylists(prev =>
      (Array.isArray(prev) ? prev : []).map(pl =>
        pl.id === favorites.id
          ? {
              ...pl,
              tracks: Array.isArray(pl.tracks)
                ? [...pl.tracks, {
                    ...currentSong,
                    albumId: currentSong.albumId ?? currentSong.album_id,
                    artistId: currentSong.artistId ?? currentSong.artist_id
                  }]
                : [{
                    ...currentSong,
                    albumId: currentSong.albumId ?? currentSong.album_id,
                    artistId: currentSong.artistId ?? currentSong.artist_id
                  }]
            }
          : pl
      )
    );
  } catch (err) {
    console.error("Ошибка добавления в 'Понравившиеся':", err);
  }
};

  const Left_menu = () => {
    setisopenLeft(!isopenLeft);
    setisopenLeftmorehoriz(!isopenLeftmorehoriz);
  };

  function custom_hook() {
    const track = audioRef.current;
    if (!track) return;
    const updateProgress = () => {
      const duration = track.duration || 0;
      const current = track.currentTime;
      setcurrentTime(current);
      setDuration(duration);
      const percent = duration ? (track.currentTime / duration) * 100 : 0;
      setCurrentSong(prev => ({ ...prev, progress: percent, length: duration }));
    };
    track.addEventListener("timeupdate", updateProgress);
    track.addEventListener("loadedmetadata", () => setDuration(track.duration || 0));
    return () => track.removeEventListener("timeupdate", updateProgress);
  }
	useEffect(() => { custom_hook(); }, []);

	const formatTime = (time) => {
    	if (!time || isNaN(time)) return "0:00";
    	const minutes = Math.floor(time / 60);
    	const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    	return `${minutes}:${seconds}`;
  	};

	const skipBack = () => {
  		setisliked(false);
  		if (!selectedPlaylist || !Array.isArray(selectedPlaylist.tracks)) return;

  		const pos = findTrackPosition(currentSong);
  		if (pos === null) return;

  		if (audioRef.current?.currentTime > 10) {
    		audioRef.current.currentTime = 0;
    		return;
 		}

  		let prevIndex = pos - 1;
  		if (prevIndex < 0) prevIndex = selectedPlaylist.tracks.length - 1;

  		const prevTrack = selectedPlaylist.tracks[prevIndex];
  		if (!prevTrack) return;

  		setCurrentSong({ ...prevTrack, progress: 0, length: 0 });
  		setisplay(true);
	};


  const Repeat = () => setisRepeat(!isRepeat);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.dispatchEvent(new Event("canplay"));
      } else {
        skipNext();
      }
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [isRepeat, currentSong]);

	const rand_track = () => setisrandom(!israndom);

	const skipNext = () => {
		setisliked(false);
  		if (!selectedPlaylist || !Array.isArray(selectedPlaylist.tracks)) return;

  		if (israndom) {
    		const allTracks = selectedPlaylist.tracks;
    		let nextTrack;
    		do {
      			nextTrack = allTracks[Math.floor(Math.random() * allTracks.length)];
    		} while (nextTrack.id === currentSong.id);
    		setCurrentSong({ ...nextTrack, progress: 0, length: 0 });
    		setisplay(true);
    		return;
  		}

  		const pos = findTrackPosition(currentSong);
 		if (pos === null) return;

  		let nextIndex = pos + 1;
  		if (nextIndex >= selectedPlaylist.tracks.length) nextIndex = 0;

  		const nextTrack = selectedPlaylist.tracks[nextIndex];
  		if (!nextTrack) return;

  		setCurrentSong({ ...nextTrack, progress: 0, length: 0 });
  		setisplay(true);
	};



	const Right_menu = () => setIsOpen(!isOpen);

  const handlePause = () => { setisplay(false); audioRef.current.pause(); };
  const handlePlay = () => { setisplay(true); audioRef.current.play(); };

  const playpauseTrack = () => { isplay ? handlePause() : handlePlay(); };

  const change_seek_bar = (e) => {
    const percent = e.target.value;
    audioRef.current.currentTime = (percent / 100) * duration;
    setCurrentSong(prev => ({ ...prev, progress: percent }));
  };

  const close_left_menu = () => {
    setisopenLeft(!isopenLeft);
    setisopenLeftmorehoriz(!isopenLeftmorehoriz);
  };

  return (
    <section className={styles.main}>
      <div className={styles.container}>
        <div className={styles.upper}>
          <div className={styles.left_menu}>
            {isopenLeftmorehoriz && (
              <span className="material-symbols-outlined" onClick={Left_menu}>more_horiz</span>
            )}
            {isopenLeft && (
              <div className={styles.open_left_menu}>
                <button className={styles.plus} onClick={close_left_menu}>✖</button>
                <button className={styles.Repeat_btn} onClick={() => setShowAddMenu(!showAddMenu)}>Добавить в плейлист</button>
                {showAddMenu && (
                  <div className={styles.playlist_dropdown}>
    {Array.isArray(playlists) && playlists.map((pl) => (
      <div
        className={styles.Playlist}
        key={pl.id}
        onClick={() => addTrackToPlaylist(pl.id, currentSong)}   // <-- выбор плейлиста
      >
        {pl.name}
      </div>
    ))}
  </div>
                )}

                <button
  className={styles.Repeat_btn}
  onClick={() => {
    if (currentSong?.artistId) {
      navigate("/third", { state: { artistId: currentSong.artistId } });
    }
  }}
>
  Открыть исполнителя
</button>

<button
  className={styles.Repeat_btn}
  onClick={() => {
    if (currentSong?.artistId && currentSong?.albumId) {
      navigate("/third", { state: { artistId: currentSong.artistId, albumId: currentSong.albumId } });
    }
  }}
>
  Открыть альбом
</button>

                <button className={styles.Repeat_btn} onClick={Repeat}>Зациклить трек</button>
              </div>
            )}
          </div>
          <a href="#" className={styles.Playlistsets} onClick={Right_menu}>
            <span className="material-symbols-outlined">menu</span>
          </a>
        </div>

        <div className={styles.diskContainer}>
  {currentSong ? (
    <div className={`${styles.disk} ${isplay ? styles.spin : ""}`}>
      <img
        src={currentSong.image || "./images/default_cover.png"}
        alt={currentSong.name || "Нет трека"}
        className={styles.diskCover}
      />
    </div>
  ) : (
    <div className={styles.disk}>
      <img
        src="./images/default_cover.png"
        alt="Нет трека"
        className={styles.diskCover}
      />
    </div>
  )}
</div>

        <div className={styles.bottomSection}>
  <audio ref={audioRef} src={currentSong?.path || ""}></audio>
  <div className={styles.info}>
    <div className={styles.trackName}>{currentSong?.name || "Нет трека"}</div>
    <div className={styles.trackArtist}>{currentSong?.artist || "Неизвестный исполнитель"}</div>
  </div>
          <div className={styles.timer}>
            <div className={styles.time}>{formatTime(currentTime)}</div>
            jsx
<input
  type="range"
  min="0"
  max="100"
  value={currentSong?.progress || 0}
  className={styles.seekSlider}
  onChange={change_seek_bar}
  style={{
    background: `linear-gradient(to right, black ${currentSong?.progress || 0}%, rgb(179,179,179) ${currentSong?.progress || 0}%)`
  }}
/>
            <div className={styles.duration}>{formatTime(duration)}</div>
          </div>
          <div className={styles.controls}>
            <div className={styles.repeat} onClick={rand_track}>
              <span className="material-symbols-outlined" style={{color: israndom ? "rgb(179,179,179)" : "black"}}>shuffle</span>
            </div>
            <div className={styles.prevTrack} onClick={skipBack}>
              <span className="material-symbols-outlined">skip_previous</span>
            </div>
            <div className={styles.playpauseTrack} onClick={playpauseTrack}>
              <span className="material-symbols-outlined">{isplay ? "pause" : "play_arrow"}</span>
            </div>
            <div className={styles.nextTrack} onClick={skipNext}>
              <span className="material-symbols-outlined">skip_next</span>
            </div>
            <div className={styles.heart} onClick={toggleFavorite}>
              <span className="material-symbols-outlined" style={{color: liked ? "rgb(179,179,179)" : "black"}}>favorite</span>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className={styles.lovedMusic}>
          <div className={styles.mymusicset}>
            <input
              type="text"
              placeholder="Поиск по плейлисту..."
              className={styles.searchInput}
              value={playlistSearch}
              onChange={(e) => setPlaylistSearch(e.target.value)}
            />
          </div>

          {selectedPlaylist && Array.isArray(selectedPlaylist.tracks) ? (
            <div className={styles.playlistContent}>
              <h3>{selectedPlaylist.name}</h3>
              {selectedPlaylist.tracks.length > 0 ? (
                <ul>
                  {selectedPlaylist.tracks.map((track, i) => {
                    const isMatch = playlistSearch && matchesSearch(track);
                    return (
                      <li
                        key={i}
                        onClick={() => handleTrackClick(track)}
                        className={`${styles.trackItem} ${isMatch ? styles.highlight : ""}`}
                      >
                        {track.name} — {track.artist}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>В этом плейлисте пока нет треков</p>
              )}
            </div>
          ) : (
            <p>Выберите плейлист в меню</p>
          )}
        </div>
      )}
    </section>
  );
}
