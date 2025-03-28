export const initialState = {
    playlists: [],  // ✅ Загружается с сервера, а не из musicDB
    playing: null,  
    bannerOpen: false,
    search: null,
    musicLang: []  // ✅ Используем массив для хранения языков
};

const musicReducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_PLAYLIST":
            return {
                ...state,
                playlists: action.payload  // ✅ Треки загружаются из API, а не из `musicDB`
            };

        case "SET_CURR_PLAYING":
            return {
                ...state,
                playing: action.payload
            };

        case "SET_BANNER_OPEN":
            return {
                ...state,
                bannerOpen: action.payload
            };

        case "INC_TIMES_PLAYED":
            return {
                ...state,
                playlists: state.playlists.map(track =>
                    track.id === action.payload
                        ? { ...track, timesPlayed: track.timesPlayed + 1 }
                        : track
                )
            };

        case "SET_SEARCH_QUERY":
            return {
                ...state,
                search: action.payload
            };

        case "SET_MUSIC_LANG":  // ✅ Фикс названия экшена
            return {
                ...state,
                musicLang: action.payload  // ✅ Redux теперь правильно хранит языки
            };

        default:
            return state;
    }
};

export default musicReducer;
