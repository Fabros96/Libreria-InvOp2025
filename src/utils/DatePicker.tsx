import { useState, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../App.css";

type TipoVista = "day" | "month" | "year";

interface MyDatePickerProps {
    minDate?: Date;
    maxDate?: Date;
    selectedDate?: Date;
    onChange: (fecha: Date | false) => void; // 👈 se acepta false
}


const ordenVistas: TipoVista[] = ["day", "month", "year"];

const MyDatePicker = forwardRef<HTMLDivElement, MyDatePickerProps>(({
    minDate,
    maxDate,
    selectedDate,
    onChange,
}, ref) => {
    const [vista, setVista] = useState<TipoVista>("day");
    const [prevVista, setPrevVista] = useState<TipoVista | null>(null);
    const [fecha, setFecha] = useState<Date | null>(selectedDate || new Date());


    const cambiarVista = (nuevaVista: TipoVista) => {
        if (nuevaVista === vista) return;

        const indiceActual = ordenVistas.indexOf(vista);
        const indiceNueva = ordenVistas.indexOf(nuevaVista);
        const indicePrev = ordenVistas.indexOf(prevVista ?? "day");

        if (
            (indiceNueva > indiceActual && indiceNueva >= indicePrev) ||
            (indiceNueva < indiceActual && indiceNueva <= indicePrev)
        ) {
            setPrevVista(vista);
            setVista(nuevaVista);
        }
    };

    const handleChange = (date: Date | null) => {
        if (date) {
            setFecha(date);
            if (vista === "year") {
                setVista("month");
                setPrevVista("year");
            } else {
                setVista("day");
                setPrevVista(null);
            }
            onChange(date);
        }
    };

    const irAHoy = () => {
        const hoy = new Date();
        setFecha(hoy);
        setVista("day");
        setPrevVista(null);
        onChange(hoy);
    };
    const limpiarDate = () => {
        setFecha(null);
        onChange(false); // 👈 devolvés false al padre
    };


    const renderHeader = ({
        date,
        decreaseMonth,
        increaseMonth,
        decreaseYear,
        increaseYear,
    }: any) => {
        const mes = date.toLocaleString("default", { month: "long" });
        const anio = date.getFullYear();

        return (
            <div className="dp-header">
                <button
                    className="dp-nav"
                    onClick={vista === "day" ? decreaseMonth : decreaseYear}
                >
                    {"<"}
                </button>

                <div className="dp-titulo">
                    {vista === "day" && (
                        <span className="dp-mes" onClick={() => cambiarVista("month")}>
                            {mes + " " + anio}
                        </span>
                    )}
                    {vista === "month" && (
                        <span className="dp-anio" onClick={() => cambiarVista("year")}>
                            {anio}
                        </span>
                    )}
                    {vista === "year" && <span className="dp-anio">Años</span>}
                </div>

                <button
                    className="dp-nav"
                    onClick={vista === "day" ? increaseMonth : increaseYear}
                >
                    {">"}
                </button>
            </div>
        );
    };

    return (
        <div ref={ref}>
            <div className="dp-wrapper">
                <DatePicker
                    selected={fecha || undefined}
                    onChange={handleChange}
                    dateFormat="yyyy-MM-dd"
                    minDate={minDate}
                    maxDate={maxDate}
                    showMonthYearPicker={vista === "month"}
                    showYearPicker={vista === "year"}
                    inline
                    renderCustomHeader={renderHeader}
                />
                <div className="dp-footer">
                    <button className="dp-hoy-btn" onClick={irAHoy}>
                        Hoy
                    </button>
                    <button className="dp-hoy-btn" onClick={limpiarDate}>
                        Limpiar
                    </button>
                </div>
            </div>
        </div>
    );
});

export default MyDatePicker;
