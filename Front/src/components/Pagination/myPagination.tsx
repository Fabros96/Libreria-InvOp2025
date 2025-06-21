import { Pagination } from "react-bootstrap";
import "./myPagination.css"; // Importamos el CSS con animaciones

interface MyPaginationProps {
  total: number;
  current: number;
  onChangePage: (page: number) => void;
}

const MyPagination = ({ total, current, onChangePage }: MyPaginationProps) => {
  let items = [];

  if (current > 1) {
    items.push(
      <Pagination.Prev
        key="prev"
        className="fade-in"
        onClick={() => onChangePage(current - 1)}
      />
    );
  }

  for (let page = 1; page <= total; page++) {
    const isEllipsis = total > 10 && (
      (page > 2 && page < current - 2) ||
      (page < total - 1 && page > current + 2)
    );

    if (isEllipsis) {
      if (items[items.length - 1]?.key !== `ellipsis-${page > current ? 'r' : 'l'}`) {
        items.push(
          <Pagination.Ellipsis
            key={`ellipsis-${page > current ? 'r' : 'l'}`}
            className="fade-ellipsis"
            disabled
          />
        );
      }
      continue;
    }

    items.push(
      <Pagination.Item
        key={page}
        className={`fade-in ${page === current ? "pulse-active" : ""}`}
        active={page === current}
        onClick={() => onChangePage(page)}
      >
        {page}
      </Pagination.Item>
    );
  }

  if (current < total) {
    items.push(
      <Pagination.Next
        key="next"
        className="fade-in"
        onClick={() => onChangePage(current + 1)}
      />
    );
  }

  return <Pagination>{items}</Pagination>;
};

export default MyPagination;
