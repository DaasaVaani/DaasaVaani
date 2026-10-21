import Dexie from "dexie";
export interface Personal {
  id: string; favorites: string[]; language: "en" | "kn"; theme: "light" | "dark";
}
const db = new Dexie(__WEB_CONFIG__.databaseName);
db.version(1).stores({ personal: "id" });
const personal = db.table<Personal, string>("personal");
export async function readPersonal(): Promise<Personal> {
  const value = await personal.get("personal");
  if (!value) return { id: "personal", favorites: [], language: __WEB_CONFIG__.defaultUiLanguage, theme: __WEB_CONFIG__.defaultTheme };
  if (value.id !== "personal" || !Array.isArray(value.favorites) ||
      value.favorites.length > __WEB_CONFIG__.maxFavorites || new Set(value.favorites).size !== value.favorites.length ||
      value.favorites.some(id => typeof id !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(id)) ||
      !["en", "kn"].includes(value.language) || !["light", "dark"].includes(value.theme)) throw new Error("Invalid personal database record");
  return value;
}
export async function updatePersonal(change: (value: Personal) => Personal): Promise<Personal> {
  return db.transaction("rw", personal, async () => {
    const value = change(await readPersonal());
    if (value.favorites.length > __WEB_CONFIG__.maxFavorites) throw new Error("Favorite collection limit reached");
    await personal.put(value);
    return value;
  });
}
