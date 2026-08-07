import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookCard from "./BookCard";

const book = {
  title: "La casa de los espíritus",
  author: "Isabel Allende",
  cover_url: "https://example.com/cover.jpg",
};

describe("BookCard", () => {
  it("muestra título, autor y badge GRATIS cuando no hay progreso", () => {
    render(<BookCard book={book} />);

    expect(screen.getByText(book.title)).toBeInTheDocument();
    expect(screen.getByText(book.author)).toBeInTheDocument();
    expect(screen.getByText("GRATIS")).toBeInTheDocument();
  });

  it("muestra el porcentaje de avance en vez del badge cuando se pasa progress", () => {
    render(<BookCard book={book} progress={35} />);

    expect(screen.queryByText("GRATIS")).not.toBeInTheDocument();
    expect(screen.getByText("35%")).toBeInTheDocument();
  });

  it("no renderiza la portada si el libro no trae cover_url", () => {
    render(<BookCard book={{ ...book, cover_url: null }} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("llama a onClick al hacer click en la card", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<BookCard book={book} onClick={onClick} />);
    await user.click(screen.getByText(book.title));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
