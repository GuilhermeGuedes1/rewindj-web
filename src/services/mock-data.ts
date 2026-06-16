import type { Event } from "@/types/event";
import type { Artist } from "@/types/artist";
import type { User } from "@/types/user";

export const mockUser: User = {
  id: "usr_01",
  name: "Alex",
  lastName: "Rivas",
  email: "alex@orbit.local",
  role: "CEO",
  organizationId: "org_orbit",
};

export const mockEvents: Event[] = [
  {
    id: "evt_001",
    title: "Warehouse Session",
    eventDate: "2026-07-04",
    startTime: "22:00",
    endTime: "04:00",
    venueName: "Galpao Aurora",
    address: "Rua das Luzes, 480",
    city: "Sao Paulo",
    state: "SP",
    notes: "Line-up com foco em house progressivo e set visual.",
    artist: {
      id: "art_001",
      fullName: "DJ Gabriel",
      email: "gabriel@orbit.local",
      phone: "11999991111",
    },
    client: {
      id: "cli_001",
      name: "Mariana Silva",
      phone: "11999990000",
      email: "mariana@cliente.local",
    },
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "evt_002",
    title: "Sunset Private",
    eventDate: "2026-07-12",
    startTime: "16:30",
    endTime: "23:00",
    venueName: "Casa Mirante",
    address: "Av. Alto da Serra, 90",
    city: "Campinas",
    state: "SP",
    notes: "Evento intimista para marca de moda.",
    artist: {
      id: "art_002",
      fullName: "Lia Moraes",
      email: "lia@orbit.local",
      phone: "11988882222",
    },
    client: {
      id: "cli_002",
      name: "Nox Studio",
      phone: "11988887777",
      email: "events@nox.local",
    },
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "evt_003",
    title: "Neon Lobby",
    eventDate: "2026-08-02",
    startTime: "20:00",
    endTime: "02:00",
    venueName: "Hotel Nox",
    address: "Rua Prata, 144",
    city: "Rio de Janeiro",
    state: "RJ",
    notes: "Recepcao premium com DJ residente e after controlado.",
    artist: {
      id: "art_003",
      fullName: "Rafa Nox",
      email: "rafa@orbit.local",
      phone: null,
    },
    client: {
      id: "cli_003",
      name: "Hotel Nox",
      phone: "21977776666",
      email: "booking@hotelnox.local",
    },
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
  },
];

export const mockArtists: Artist[] = [
  {
    id: "art_001",
    fullName: "DJ Gabriel",
    stageName: "DJ Gabriel",
    email: "gabriel@orbit.local",
    phone: "11999991111",
  },
  {
    id: "art_002",
    fullName: "Lia Moraes",
    stageName: "Lia Moraes",
    email: "lia@orbit.local",
    phone: "11988882222",
  },
  {
    id: "art_003",
    fullName: "Rafa Nox",
    stageName: "Rafa Nox",
    email: "rafa@orbit.local",
    phone: null,
  },
];
