import { NavLink } from 'react-router-dom';
import "./Item.css";
import type { JSX } from 'react';
import "../../../App.css";

interface ItemProps {
  text: string;
  to: string;
  svg: JSX.Element;
  open: boolean;
}

const Item: React.FC<ItemProps> = ({ text, to, svg, open }) => {
  return (
    <NavLink className="sidebar-link" to={to}>
      <div className="icon">{svg}</div>
      <span className={`link-text ${open ? "show" : ""}`}>{text}</span>
    </NavLink>
  );
};

export default Item;
