import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import ReactPaginateModule from "react-paginate";
import type { ReactPaginateProps } from "react-paginate";
import type { ComponentType } from "react";

import SearchBar from "../SearchBar/SearchBar";
import { fetchMovies } from "../../services/movieService";
import type { Movie } from "../../types/movie";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";
import css from "./App.module.css";

type ModuleWithDefault<T> = { default: T };

const ReactPaginate = (
  ReactPaginateModule as unknown as ModuleWithDefault<
    ComponentType<ReactPaginateProps>
  >
).default;

function App() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const { data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ["movies", query, page],
    queryFn: async () => {
      const response = await fetchMovies(query, page);
      return response;
    },
    placeholderData: keepPreviousData,
    enabled: !!query,
  });

  useEffect(() => {
    if (isSuccess && data?.results.length === 0) {
      toast.error("No movies found for your request.");
    }
  }, [isSuccess, data]);

  const openModal = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const closeModal = () => {
    setSelectedMovie(null);
  };

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
  };

  const movies = data?.results || [];
  const totalPages = data?.total_pages || 0;

  return (
    <div className={css.app}>
      <SearchBar onSubmit={handleSearch} />
      {isFetching && <Loader />}
      {isError && <ErrorMessage />}
      {!isFetching && !isError && movies.length > 0 && (
        <MovieGrid movies={movies} onSelect={openModal} />
      )}
      {!isFetching && !isError && totalPages > 1 && (
        <ReactPaginate
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setPage(selected + 1)}
          forcePage={page - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={closeModal} />
      )}
    </div>
  );
}

export default App;
