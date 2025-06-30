import { Modal, Button, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { CSSTransition } from "react-transition-group";
import MyDatePicker from "../../utils/DatePicker";
import { showToasty } from "../../utils/toasty"


import "../../utils/calendarAnimation.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../../App.css";



interface ArtVtaProps {
    ap: any | null;
    show: boolean;
    onHide: () => void;
    onVta: (updatedArticulo: any) => void;
}



const ArtVta = ({ show, onHide, ap, onVta }: ArtVtaProps) => {


    const [selectedIdArticulo, setSelectedIdArticulo] = useState<number | null>(null);
    const [selectedDescripcion, setSelectedDescripcion] = useState<string>("");

    const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);
    const datePickerRef = useRef(null); 
    const [mostrarCalendario, setMostrarCalendario] = useState(false);


    const [stock, setStock] = useState(0);
    const [precio, setPrecio] = useState(ap.precioUnitario);
    const [totalPrice, setTotalPrice] = useState(0);
    const [cantidad, setCantidad] = useState(0);

    useEffect(() => {
        setTotalPrice(precio * cantidad);
    }, [cantidad, precio]);




    useEffect(() => {

        setSelectedIdArticulo(ap.idArticulo || "");
        setSelectedDescripcion(ap.descripcion || "");

        setStock(ap.stock || 0);
        setPrecio(ap.precioUnitario || 0);
        setTotalPrice(ap.totalPrice || 0);


    }, [ap.articulo]);

    const handleVta = () => {
        if (!selectedIdArticulo) return;
        if (ap.articulo) {
            const updatedArticulo = {
                ...ap.articulo,
                displayName: selectedDescripcion
            };
            showToasty('Venta realizada exitosamente', 'success');


            onVta(updatedArticulo);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Nueva Venta</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Artículo: #</Form.Label>
                    <div style={{ fontWeight: 'bold', color: 'var(--primario)', rowGap: '5px', display: 'inline-flex', justifyContent: 'space-between', gap: '5px' }}>
                        <Form.Label>{selectedIdArticulo}</Form.Label> -
                        <Form.Label>{selectedDescripcion}</Form.Label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div>
                            <Form.Label><strong style={{ fontWeight: 'bold', color: 'var(--primario)' }}>Precio Unitario: </strong>${precio}</Form.Label><br />
                            <Form.Label><strong style={{ fontWeight: 'bold', color: 'var(--primario)' }}>Stock: </strong>{stock}</Form.Label><br />
                            <Form.Label><strong style={{ fontWeight: 'bold', color: 'var(--primario)' }}>Cantidad</strong></Form.Label>
                            <Form.Control
                                type="number"
                                min={0}
                                max={ap.stock}
                                value={cantidad}
                                onChange={(e) => setCantidad(Number(e.target.value))}
                                onBlur={() => {
                                    if (cantidad > ap.stock) {
                                        setCantidad(ap.stock);
                                    } else if (cantidad < 0) {
                                        setCantidad(0);
                                    }
                                }}
                            />
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'flex-end', flexDirection: 'column' }}>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                style={{ marginTop: "10px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}
                                onClick={() => setMostrarCalendario(!mostrarCalendario)}
                            >
                                {fechaSeleccionada ? fechaSeleccionada.toLocaleDateString() : "Fecha"}
                                {mostrarCalendario ? (
                                    <><i className="bi bi-x"></i></>
                                ) : (
                                    <><i className="bi bi-calendar-check"></i></>
                                )}
                            </Button>

                            <CSSTransition
                                in={mostrarCalendario}
                                timeout={300}
                                classNames="fade"
                                unmountOnExit
                                nodeRef={datePickerRef}
                            >
                                <div ref={datePickerRef}>
                                    <MyDatePicker
                                        selectedDate={fechaSeleccionada || new Date()}
                                        minDate={new Date(2020, 0, 1)}
                                        maxDate={new Date(2030, 11, 31)}
                                        onChange={(f) => {
                                            setFechaSeleccionada(f && typeof f !== "boolean" ? f : null);  // <-- guardamos la fecha acá
                                            setMostrarCalendario(false);
                                        }}
                                    />

                                </div>
                            </CSSTransition>
                        </div>
                    </div>
                    <hr className="hr hr-blurry" style={{ fontWeight: 'bolder', height: '3px', backgroundColor: 'black' }}></hr>
                    <Form.Label>
                        <strong style={{ fontWeight: 'bold', color: 'var(--primario)' }}>Precio Total: </strong>
                        ${totalPrice.toFixed(2)}
                    </Form.Label>



                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-danger" onClick={onHide}>
                    Cancelar
                </Button>
                <Button variant="outline-success" onClick={handleVta}>
                    Realizar Venta
                </Button>
            </Modal.Footer>

        </Modal >
    );
};

export default ArtVta;
