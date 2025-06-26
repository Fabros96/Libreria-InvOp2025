import { useState } from "react";
import "./Sidebar.css";
import Routes from "../../routes/Routes";
import Item from "./Item/Item";
import "../../App.css";
// import { CloseButton } from "react-bootstrap";

const Sidebar = () => {
  const [open, setOpen] = useState(false);


  return (


    <div className={open ? "sidebarOpen" : "sidebar"}>
      {open ?
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="hamburger" viewBox="0 0 16 16" onClick={() => setOpen(!open)}>
          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
        </svg>
        : <svg xmlns="http://www.w3.org/2000/svg"
          className={"hamburger"}
          onClick={() => setOpen(!open)}
          viewBox="0 0 18 12">
          <path d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
        </svg>}

      <div className={"linksContainer"}>

        {Routes.map((route) => (
          <Item
            key={route.to}
            open={open}
            to={route.to}
            text={route.text}
            svg={route.svg} />
        ))}
      </div>
    </div>

  )
}
export default Sidebar