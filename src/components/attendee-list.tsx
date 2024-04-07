import {
  Search,
  MoreHorizontal,
  ChevronsLeft,
  ChevronLeft,
  ChevronsRight,
  ChevronRight,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";
import { IconButton } from "./icon-button";
import { Table } from "./table/table";
import { TableHeader } from "./table/table-header";
import { TableData } from "./table/table-data";
import { TableRow } from "./table/table-row";
import { ChangeEvent, useEffect, useState } from "react";

dayjs.extend(relativeTime);
dayjs.locale("pt-br");

interface Attendee {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  checkedInAt: string | null;
}

interface SearchParam {
  [key: string]: string | number;
}

type DefaultValueType<T extends boolean> = T extends true ? number : string;

export function AttendeeList() {
  const RECORDS_PER_PAGE = 10;
  const [search, setSearch] = useState(() => getSearchParamValue('search', '') as string);
  const [page, setPage] = useState(() => getSearchParamValue('page', 1) as number);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeesCount, setAttendeesCount] = useState(0);
  const totalPages =
    attendeesCount > 1 ? Math.ceil(attendeesCount / RECORDS_PER_PAGE) : 1;

  useEffect(() => {
    const url = new URL(
      "http://localhost:3333/events/9e9bd979-9d10-4915-b339-3786b1634f33/attendees"
    );
    url.searchParams.set("pageIndex", String(page - 1));
    if (search.length > 0) {
      url.searchParams.set("query", search);
    }
    fetch(url)
      .then((response) => response.json())
      .then(({ attendees = [], total = 0 }) => {
        setAttendees(attendees);
        setAttendeesCount(total);
      });
  }, [page, search]);

  function onSearchInputChanged(event: ChangeEvent<HTMLInputElement>) {
    setCurrentSearch(event.target.value);
  }

  function goToFirstPage() {
    setCurrentPage(1);
  }

  function goToLastPage() {
    setCurrentPage(totalPages);
  }

  function goToPreviousPage() {
    setCurrentPage(page - 1);
  }

  function goToNextPage() {
    setCurrentPage(page + 1);
  }

  function setCurrentPage(page: number) {
    setSearchParams({ page });
    setPage(page);
  }

  function setCurrentSearch(search: string) {
    setSearchParams({ search, page: 1 });
    setSearch(search);
  }

  function setSearchParams(searchParam: SearchParam) {
    const url = new URL(window.location.toString());

    for (const key in searchParam) {
      if (Object.prototype.hasOwnProperty.call(searchParam, key)) {
        url.searchParams.set(key, String(searchParam[key]));
      }
    }

    window.history.pushState({}, "", url);
  }

  function getSearchParamValue(
    searchParamKey: string,
    defaultValue: DefaultValueType<boolean>
  ) {
    const url = new URL(window.location.toString());

    if (url.searchParams.has(searchParamKey)) {
      const value = url.searchParams.get(searchParamKey);
      return typeof defaultValue === "number"
        ? Number(value)
        : value || defaultValue;
    }

    return defaultValue;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 items-center">
        <h1 className="text-2xl font-bold">Participantes</h1>
        <div className="px-3 w-72 py-1.5 border border-white/10 rounded-lg text-sm flex items-center gap-3">
          <Search className="size-4 text-emerald-300" />
          <input
            type="search"
            placeholder="Buscar participante..."
            className="bg-transparent flex-1 outline-none border-0 p-0 text-sm focus:ring-0"
            value={search}
            onChange={onSearchInputChanged}
          />
        </div>
      </div>

      <Table>
        <thead>
          <tr className="border-b border-white/10">
            <TableHeader style={{ width: 48 }}>
              <input
                type="checkbox"
                name="select"
                id="select"
                className="size-4 bg-black/20 rounded border border-white/10"
              />
            </TableHeader>
            <TableHeader>Código</TableHeader>
            <TableHeader>Participante</TableHeader>
            <TableHeader>Data de inscrição</TableHeader>
            <TableHeader>Data do check-in</TableHeader>
            <TableHeader style={{ width: 64 }}></TableHeader>
          </tr>
        </thead>
        <tbody>
          {attendees.map(({ id, name, email, createdAt, checkedInAt }) => (
            <TableRow key={id}>
              <TableData>
                <input
                  type="checkbox"
                  name="select"
                  id="select"
                  className="size-4 bg-black/20 rounded border border-white/10"
                />
              </TableData>
              <TableData>{id}</TableData>
              <TableData>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-white">{name}</span>
                  <span>{email}</span>
                </div>
              </TableData>
              <TableData>{dayjs().to(createdAt)}</TableData>
              <TableData>
                {checkedInAt === null ? (
                  <span className="text-zinc-400">Não fez check-in</span>
                ) : (
                  dayjs().to(checkedInAt)
                )}
              </TableData>
              <TableData>
                <IconButton transparent>
                  <MoreHorizontal className="size-4" />
                </IconButton>
              </TableData>
            </TableRow>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <TableData colSpan={3}>
              Mostrando {attendees.length} de {attendeesCount} itens
            </TableData>
            <TableData className="text-right" colSpan={3}>
              <div className="inline-flex items-center gap-8">
                <span>
                  Página {page} de {totalPages}
                </span>
                <div className="flex gap-1.5">
                  <IconButton onClick={goToFirstPage} disabled={page === 1}>
                    <ChevronsLeft className="size-4" />
                  </IconButton>
                  <IconButton onClick={goToPreviousPage} disabled={page === 1}>
                    <ChevronLeft className="size-4" />
                  </IconButton>
                  <IconButton
                    onClick={goToNextPage}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="size-4" />
                  </IconButton>
                  <IconButton
                    onClick={goToLastPage}
                    disabled={page === totalPages}
                  >
                    <ChevronsRight className="size-4" />
                  </IconButton>
                </div>
              </div>
            </TableData>
          </tr>
        </tfoot>
      </Table>
    </div>
  );
}
