import { Card, Badge, Row, Col } from "react-bootstrap";

// Tarjeta de libro reusada en el catálogo gratuito, el catálogo de pago
// (GET /books/paid), "Continuar leyendo" y el historial de lectura del
// dashboard. Si se pasa `progress`, muestra la barra de avance en vez del
// badge. El badge en sí refleja `book.is_free` real — antes decía "GRATIS"
// fijo sin mirar el dato, lo cual era inofensivo mientras BookCard solo
// recibía libros gratuitos, pero quedó mal en cuanto empezó a reusarse
// también para libros de pago.
const BookCard = ({ book, onClick, progress }) => {
  return (
    <Card className="bc-card" onClick={onClick}>
      <Card.Body className="p-3">
        <Row className="align-items-center g-2">
          {book.cover_url && (
            <Col xs="auto">
              <img
                src={book.cover_url}
                alt={book.title}
                style={{
                  width: "48px",
                  height: "64px",
                  borderRadius: "6px",
                  objectFit: "cover",
                }}
              />
            </Col>
          )}
          <Col>
            <div className="bc-card-title">{book.title}</div>
            <div className="bc-card-subtitle">{book.author}</div>
            {progress === undefined ? (
              book.is_free === false ? (
                <Badge className="bc-badge-active mt-1">SUSCRIPCIÓN</Badge>
              ) : (
                <Badge className="bc-badge-free mt-1">GRATIS</Badge>
              )
            ) : (
              <div className="d-flex align-items-center gap-2 mt-1">
                <div className="bc-progress flex-grow-1">
                  <div className="bc-progress-bar" style={{ width: `${progress}%`, height: "100%" }} />
                </div>
                <span style={{ fontSize: "0.7rem", color: "var(--ivory-dim)", flexShrink: 0 }}>
                  {progress}%
                </span>
              </div>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default BookCard;
