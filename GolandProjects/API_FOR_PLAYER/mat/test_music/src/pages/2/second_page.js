import { useState} from "react";
import Header from "./header_2.js";
import Main from "./main_2.js";
import Footer from "./footer_2.js";
import { useLocation } from "react-router-dom";

export default function Second_page(){
        const [playlists, setPlaylists] = useState([
            { id: 1, name: "Понравившееся", tracks: [] }
        ]);
    
        const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
        const selectedPlaylist = playlists.find(pl => pl.id === selectedPlaylistId);
        const location = useLocation();
        const user = location.state?.user;
    return(
        <>
            <Header
                user={user}
                playlists={playlists}
                setPlaylists={setPlaylists}
                setSelectedPlaylistId={setSelectedPlaylistId} 
            />
            <Main
                playlists={playlists}
                setPlaylists={setPlaylists}
                selectedPlaylistId={selectedPlaylistId}   // <-- передаём id
            />

            <Footer />
        </>
    )
}