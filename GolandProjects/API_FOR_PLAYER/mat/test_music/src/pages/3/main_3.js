import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./third_page.module.scss";

export default function Main() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("artist");
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);

  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [tracks, setTracks] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAlbums, setShowAlbums] = useState(false);

  // обработка перехода со второй страницы
  useEffect(() => {
    if (location.state?.artistId && !location.state?.albumId) {
      setSelectedArtistId(location.state.artistId);
      setActiveSection("artist");
    }
    if (location.state?.artistId && location.state?.albumId) {
      setSelectedArtistId(location.state.artistId);
      setSelectedAlbumId(location.state.albumId);
      setActiveSection("album");
    }
  }, [location.state]);

  // загрузка артистов
  useEffect(() => {
    fetch("/artists")
      .then(res => res.json())
      .then(data => setArtists(data || []))
      .catch(err => console.error("Ошибка загрузки артистов:", err));
  }, []);

  // загрузка альбомов выбранного артиста
  useEffect(() => {
    if (!selectedArtistId) return;
    fetch(`/artists/${selectedArtistId}/albums`)
      .then(res => res.json())
      .then(data => setAlbums(data || []))
      .catch(err => console.error("Ошибка загрузки альбомов:", err));
  }, [selectedArtistId]);

  // загрузка треков выбранного альбома
  useEffect(() => {
    if (!selectedAlbumId) return;
    fetch(`/albums/${selectedAlbumId}/tracks`)
      .then(res => res.json())
      .then(data => setTracks(data || []))
      .catch(err => console.error("Ошибка загрузки треков:", err));
  }, [selectedAlbumId]);

  const artist = artists.find(a => a.id === selectedArtistId);

  // поиск по артистам и альбомам
  const filteredArtists = (artists || []).filter(a => {
    const artistMatch = a.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const albumMatch = (albums || [])
      .filter(al => al.artist_id === a.id)
      .some(al => al.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return artistMatch || albumMatch;
  });

  return (
    <>
      {/* Поиск */}
      <div className={styles.searchWrapper}>
        <input
          type="text"
          placeholder="Type here..."
          className={styles.searchInput_3}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {searchTerm && (
          <ul className={styles.suggestions}>
            {filteredArtists.length > 0 ? (
              filteredArtists.map((a) => (
                <li key={`artist-${a.id}`}>
                  <button
                    className={styles.suggestionItem}
                    onClick={() => {
                      setSelectedArtistId(a.id);
                      setActiveSection("artist");
                      setSelectedAlbumId(null);
                      setSearchTerm("");
                    }}
                  >
                    {a.name}
                  </button>
                  {(albums || [])
                    .filter(al =>
                      al.artist_id === a.id &&
                      al.name?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(al => (
                      <button
                        key={al.id}
                        className={styles.suggestionItem}
                        onClick={() => {
                          setSelectedArtistId(a.id);
                          setSelectedAlbumId(al.id);
                          setActiveSection("album");
                          setSearchTerm("");
                        }}
                      >
                        {al.name}
                      </button>
                    ))}
                </li>
              ))
            ) : (
              <li className={styles.noResults}>Ничего не найдено</li>
            )}
          </ul>
        )}
      </div>

      {/* Стартовый экран */}
      {!artist && (
        <section className={styles.startInfo}>
          <h2>Добро пожаловать в музыкальную библиотеку</h2>
          <p>Воспользуйтесь поиском, чтобы найти артиста или альбом.</p>
        </section>
      )}

      {/* Артист */}
      {activeSection === "artist" && artist && (
        <section className={styles.info_about}>
          <div className={styles.connect}>
            <div className={styles.artist_info}>
              <img src={artist.image} alt={artist.name} />
              <button
                className={styles.Choose_album}
                onClick={() => setShowAlbums(!showAlbums)}
              >
                Выбрать альбом
              </button>

              {showAlbums && (
                <div className={styles.albumList}>
                  {(albums || [])
                    .filter(al => artist && al.artist_id === artist.id)
                    .map(al => (
                      <button
                        key={al.id}
                        className={styles.albumLink}
                        onClick={() => {
                          setSelectedAlbumId(al.id);
                          setActiveSection("album");
                          setShowAlbums(false);
                        }}
                      >
                        {al.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
            <div className={styles.short_info_about_artist}>
              <ul className={styles.text_info}>
                <li>{artist.description}</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Альбом */}
      {activeSection === "album" && (
        <section className={styles.album_section}>
          <div className={styles.album_info}>
            <div className={styles.album_text}>
              <h2>{(albums || []).find(al => al.id === selectedAlbumId)?.name}</h2>
              <p>{(albums || []).find(al => al.id === selectedAlbumId)?.description}</p>

              <button
                className={styles.backButton}
                onClick={() => {
                  setActiveSection("artist");
                  setSelectedAlbumId(null);
                }}
              >
                Вернуться к артисту
              </button>

              <div className={styles.trackList}>
                {(tracks || []).map(track => (
                  <button
                    key={track.id}
                    className={styles.trackButton}
                    onClick={() => navigate("/second", { state: { track } })}
                  >
                    {track.name}
                  </button>
                ))}
              </div>
            </div>
            <img
              src={(albums || []).find(al => al.id === selectedAlbumId)?.cover}
              alt=""
            />
          </div>
        </section>
      )}
    </>
  );
}
