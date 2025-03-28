export const setPlaylist = (playlist) => ({
    type: "SET_PLAYLIST",
    payload: playlist
});

export const setCurrentPlaying = (curr_music) => ({
    type: "SET_CURR_PLAYING",
    payload: curr_music
});

export const setBannerOpen = (isOpen) => ({
    type: "SET_BANNER_OPEN",
    payload: isOpen
});

export const increaseTimesPlayed = (id) => ({
    type: "INC_TIMES_PLAYED",
    payload: id
});

export const setSearch = (searchQuery) => ({
    type: "SET_SEARCH_QUERY",
    payload: searchQuery
});

// ✅ Фикс названия экшена
export const setMusicLang = (langList) => ({
    type: "SET_MUSIC_LANG",
    payload: langList.map(lang => lang.toUpperCase())  // ✅ Приводим к верхнему регистру
});

