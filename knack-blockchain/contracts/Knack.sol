// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Knack {
    uint256 listenerIDTracker;
    uint256 artistIDTracker;
    uint256 songIDTracker;

    enum UserType {
        UNDEFINED,
        ARTIST,
        LISTENER
    }

    struct Artist {
        string name;
        uint256 artistID;
        uint256[] songsPublished;
    }

    struct Listener {
        string name;
        uint256 listenerID;
        uint256[] songsPurchased;
        mapping(uint256 => bool) isSongPurchased;
    }

    struct Song {
        string songName;
        string artistName;
        string genre;
        string hash;
        uint256 songID;
        uint256 price;
        address payable artistAddress;
    }

    mapping(address => UserType) identifyUser;
    mapping(address => Artist) allArtists;
    mapping(address => Listener) allListeners;
    mapping(uint256 => Song) allSongs;
    mapping(uint256 => uint256) timesSongPurchased;
    mapping(string => bool) songHashUsed;
    mapping(string => address payable) getArtistAddress;

    constructor() {
        songIDTracker = 0;
        artistIDTracker = 0;
        listenerIDTracker = 0;
    }

    function getNumSongs() public view returns (uint256) {
        return songIDTracker;
    }

    function checkUser() public view returns (UserType) {
        return identifyUser[msg.sender];
    }

    function addNewListener(string memory _name) public {
        listenerIDTracker += 1;
        Listener storage newListener = allListeners[msg.sender];
        newListener.name = _name;
        newListener.listenerID = listenerIDTracker;
        identifyUser[msg.sender] = UserType.LISTENER;
    }

    function addNewArtist(string memory _name) public {
        artistIDTracker += 1;
        Artist memory newArtist;
        newArtist.name = _name;
        newArtist.artistID = artistIDTracker;
        getArtistAddress[_name] = payable(msg.sender);
        allArtists[msg.sender] = newArtist;
        identifyUser[msg.sender] = UserType.ARTIST;
    }

    function getListenerDetails()
        public
        view
        returns (
            string memory,
            uint256,
            uint256[] memory
        )
    {
        return (
            allListeners[msg.sender].name,
            allListeners[msg.sender].listenerID,
            allListeners[msg.sender].songsPurchased
        );
    }

    function getArtistDetails()
        public
        view
        returns (
            string memory,
            uint256,
            uint256[] memory
        )
    {
        return (
            allArtists[msg.sender].name,
            allArtists[msg.sender].artistID,
            allArtists[msg.sender].songsPublished
        );
    }

    event songAdded(uint256 songID, string songName, string artistName, uint256 price);

    function addSong(
        string memory _name,
        string memory _genre,
        string memory _hash,
        uint256 _price
    ) public {
        require(identifyUser[msg.sender] == UserType.ARTIST, "Not an artist.");
        require(!songHashUsed[_hash], "Duplicate hash has been detected.");

        songIDTracker += 1;

        Song memory newSong;
        newSong.songID = songIDTracker;
        newSong.songName = _name;
        newSong.artistName = allArtists[msg.sender].name;
        newSong.genre = _genre;
        newSong.hash = _hash;
        newSong.price = _price;
        newSong.artistAddress = payable(msg.sender);

        timesSongPurchased[songIDTracker] = 0;

        allSongs[songIDTracker] = newSong;
        allArtists[msg.sender].songsPublished.push(songIDTracker);
        songHashUsed[_hash] = true;

        emit songAdded(newSong.songID, newSong.songName, newSong.artistName, newSong.price);
    }

    function getSongDetails(uint256 _songID)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            uint256,
            uint256
        )
    {
        return (
            allSongs[_songID].songName,
            allSongs[_songID].artistName,
            allSongs[_songID].genre,
            allSongs[_songID].hash,
            allSongs[_songID].price,
            timesSongPurchased[_songID]
        );
    }
}
