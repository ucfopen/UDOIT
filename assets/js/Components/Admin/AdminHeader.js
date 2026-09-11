import React from "react";
import UDOITLogo from "../../../mediaAssets/udoit-logo.svg";
import HomeIcon from "../Icons/HomeIcon";
import ContentAssignmentIcon from "../Icons/ContentAssignmentIcon";
import UserIcon from "../Icons/UserIcon";
import "../Header.css";

export default function AdminHeader({
  t,
  navigation,
  handleNavigation,
}) {


  const links = [
    {name: t('Dashboard'), icon: HomeIcon, key: 'dashboard'},
    {name: t('Courses'), icon: ContentAssignmentIcon, key: 'courses'}
  ]


  return (
    <header id="udoit-header" role="banner">
      <img alt={t("alt.UDOIT")} src={UDOITLogo}></img>
        <div id="nav-container">
          <div className="flex-row gap-1" id="nav-row">
            <nav aria-label={t('menu.nav.label')}>
              <ul id="main-nav">
                {links.map(link => (
                <li
                  key={link.key}
                  role="link"
                  aria-label={link.name}
                  className={navigation === link.key ? 'active-link' : ''}
                  onClick={()=>handleNavigation(link.key)}
                  onKeyDown={(e) => {
                    if(e.key === 'Enter' || e.key === ' ') {
                      handleNavigation(link.key)
                    }
                  }}
                  tabIndex='0'>
                  <link.icon className='icon-md' aria-hidden="true"/>
                  <div aria-hidden="true">{link.name}</div>
                </li>
              ))}
              </ul>
            </nav>
          </div>
        </div>
    </header>
  );
}
