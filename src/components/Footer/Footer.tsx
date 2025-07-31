import icono from "../../assets/logo-utn.png";

const Footer = () => {
  return (
    <footer
      style={{
        fontSize: "0.9rem",
        width: "100%",
        height: "100px",
        backgroundColor: "var(--detalles)",
         background: "linear-gradient(to bottom, var(--primario), #000000)", // 🎨 degradé vertical
        textAlign: "center",
        fontStyle: "italic",
        color: "var(--secundario)",
        padding: "13px 0",
        position: "fixed",
        bottom: 0,
        left: 0,
        zIndex: -100,
      }}
    >
      <div><img src={icono} alt="LogoUTN" style={{ width: "20px", verticalAlign: "middle", marginRight: "8px" }}/>UTN FRM. Cátedra: Investigación Operativa ciclo 2025 - Proyecto Final<br /></div>
      <div><a href="https://github.com/Fabros96/Libreria-InvOp2025" target="_blank" rel="noopener noreferrer"> Repositorio</a> &copy;Todos los derechos reservados.</div >
    </footer >
  );
};

export default Footer;
