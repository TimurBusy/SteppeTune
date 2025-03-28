import React from "react";
import '../assets/scss/BottomNavigation.scss';
import { HomeOutlined, AccountCircleOutlined, Search, ExploreOutlined } from "@material-ui/icons";
import { Button } from "@material-ui/core";
import { Link, useLocation } from "react-router-dom";

function BottomNavigationMobile() {
    const location = useLocation();

    const menuItems = [
        { id: 0, icon: <HomeOutlined />, href: "/home", label: "Home" },
        { id: 1, icon: <Search />, href: "/home/search", label: "Search" },
        { id: 2, icon: <AccountCircleOutlined />, href: "/home/profile", label: "Profile" },
        { id: 3, icon: <ExploreOutlined />, href: "/home/about", label: "About" }
    ];

    return (
        <div className="bottom-navigation">
            {menuItems.map(({ id, icon, href, label }) => (
                <Link className="bottom-navigation-link" key={id} to={href}>
                    <Button className={`BottomNavAction ${location.pathname === href ? "active" : ""}`}
                        style={{ borderRadius: 0 }}>
                        {icon}
                    </Button>
                    <span className="label">{label}</span>
                </Link>
            ))}
        </div>
    );
}

export default BottomNavigationMobile;
