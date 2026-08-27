type ArtistNameSource = {
  name?: string | null;
  stageName?: string | null;
};

export function getArtistDisplayName(
  artist?: ArtistNameSource | null,
  fallback = "Artista",
) {
  const stageName = artist?.stageName?.trim();
  const name = artist?.name?.trim();

  return (
    (stageName && stageName !== "string" ? stageName : null) || name || fallback
  );
}
