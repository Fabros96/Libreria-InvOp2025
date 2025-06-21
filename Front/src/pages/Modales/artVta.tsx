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
    agent: any | null;
    show: boolean;
    onHide: () => void;
    onVta: (updatedAgent: any) => void;
}



const ArtVta = ({ show, onHide, agent, onVta }: ArtVtaProps) => {


    const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
    const [selectedName, setSelectedName] = useState<string>("");

    const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);

    const datePickerRef = useRef(null); // nueva línea
    const [mostrarCalendario, setMostrarCalendario] = useState(false);

    const [stock, setStock] = useState(0);
    const [price, setPrice] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [rotacion, setRotacion] = useState(0);
    const [cantidad, setCantidad] = useState(0);




    useEffect(() => {

        setSelectedUuid(agent.uuid || "");
        setSelectedName(agent.displayName || "");
        setStock(agent.stock || 0);
        setPrice(agent.price || 0);
        setTotalPrice(agent.totalPrice || 0);
        setRotacion(agent.tasaRotacion || 0);

    }, [agent]);

    const handleVta = () => {
        if (!selectedUuid) return;
        if (agent) {
            const updatedAgent = {
                ...agent,
                displayName: selectedName
            };
            showToasty('Venta realizada exitosamente', 'success');


            onVta(updatedAgent);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Nueva Venta</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Artículo</Form.Label>
                    <div style={{ fontWeight: 'bold', color: 'var(--primario)', rowGap: '50px', display: 'inline-flex', justifyContent: 'space-between', gap: '100px' }}>
                        <Form.Label>{selectedUuid}</Form.Label> -
                        <Form.Label>{selectedName}</Form.Label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div>
                            <Form.Label><strong style={{ fontWeight: 'bold', color: 'var(--primario)' }}>Precio Unitario: </strong>${price}</Form.Label><br />
                            <Form.Label><strong style={{ fontWeight: 'bold', color: 'var(--primario)' }}>Stock: </strong>${stock}</Form.Label><br />
                            <Form.Label><strong style={{ fontWeight: 'bold', color: 'var(--primario)' }}>Cantidad</strong></Form.Label>
                            <Form.Control
                                type="number"
                                min={0}
                                max={9999999}
                                value={cantidad}
                                onChange={(e) => setCantidad(Number(e.target.value))}
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
                                nodeRef={datePickerRef} // 👈 IMPORTANTE
                            >
                                <div ref={datePickerRef}>
                                    <MyDatePicker
                                        selectedDate={fechaSeleccionada || new Date()}
                                        minDate={new Date(2020, 0, 1)}
                                        maxDate={new Date(2030, 11, 31)}
                                        onChange={(f) => {
                                            console.log("Seleccionaste:", f);
                                            setFechaSeleccionada(f && typeof f !== "boolean" ? f : null);  // <-- guardamos la fecha acá
                                            setMostrarCalendario(false);
                                        }}
                                    />

                                </div>
                            </CSSTransition>
                        </div>
                    </div>
                    <hr className="hr hr-blurry" style={{ fontWeight: 'bolder', height: '3px', backgroundColor: 'black' }}></hr>
                    <Form.Label ><strong style={{ fontWeight: 'bold', color: 'var(--primario)' }}>Precio Total: </strong>${totalPrice}</Form.Label><br />


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
