import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function useCrafts(path) {
  const [result, setResult] = useState({ data: null, error: "" });
  useEffect(() => {
    const request = new AbortController();
    fetch(path, { signal: request.signal })
      .then((response) => {
        if (response.status === 404) throw new Error("Bu kayıt bulunamadı.");
        if (!response.ok) throw new Error("Kayıtlar yüklenemedi.");
        return response.json();
      })
      .then((data) => setResult({ data, error: "" }))
      .catch((error) => {
        if (!request.signal.aborted) {
          setResult({ data: null, error: error.message });
        }
      });
    return () => request.abort();
  }, [path]);
  return result;
}

function Photo({ craft }) {
  return craft.image
    ? <img className="photo" src={craft.image} alt={craft.name} />
    : <div className="photo placeholder">Görsel eklenmemiş</div>;
}

function Explore() {
  const { data, error } = useCrafts("/api/crafts/");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  if (error) return <p role="alert">{error}</p>;
  if (!data) return <p role="status">Kayıtlar yükleniyor…</p>;

  const locations = [...new Set(data.map((craft) => craft.location))].sort();
  const categories = [...new Set(data.map((craft) => craft.category))].sort();
  const matches = data.filter((craft) =>
    (!location || craft.location === location) &&
    (!category || craft.category === category)
  );

  return <>
    <div className="filters">
      <label>Konum
        <select value={location} onChange={(event) => setLocation(event.target.value)}>
          <option value="">Tüm konumlar</option>
          {locations.map((value) => <option key={value}>{value}</option>)}
        </select>
      </label>
      <label>Kategori
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">Tüm kategoriler</option>
          {categories.map((value) => <option key={value}>{value}</option>)}
        </select>
      </label>
    </div>
    <p role="status">{matches.length ? matches.length + " kayıt" : "Bu seçimde kayıt bulunamadı."}</p>
    <div className="grid">
      {matches.map((craft) => <a className="card" key={craft.id} href={"/crafts/" + craft.id + "/"}>
        <Photo craft={craft} />
        <div className="body">
          <p className="eyebrow">{craft.category}</p>
          <h2>{craft.name}</h2>
          <p>{craft.location}</p>
        </div>
      </a>)}
    </div>
  </>;
}

function Detail({ id }) {
  const { data: craft, error } = useCrafts("/api/crafts/" + id + "/");
  return <>
    <a href="/">← Keşfe dön</a>
    {error && <p role="alert">{error}</p>}
    {!error && !craft && <p role="status">Kayıt yükleniyor…</p>}
    {craft && <article className="detail">
      <p className="eyebrow">{craft.category}</p>
      <h1>{craft.name}</h1>
      <Photo craft={craft} />
      <p>{craft.description}</p>
      <dl>
        <dt>Konum</dt><dd>{craft.location}</dd>
        <dt>Malzemeler</dt><dd>{craft.materials}</dd>
        {craft.weight != null && <><dt>Ağırlık</dt><dd>{craft.weight}</dd></>}
      </dl>
    </article>}
  </>;
}

const detail = window.location.pathname.match(/^\/crafts\/(\d+)\/?$/);
createRoot(document.getElementById("root")).render(
  <>
    <header><a href="/">Local Craft Discovery Guide</a></header>
    <main>
      {detail ? <Detail id={detail[1]} /> : <>
        <section className="hero">
          <p className="eyebrow">Yerel el sanatları rehberi</p>
          <h1>Yakınındaki el sanatlarını keşfet</h1>
          <p>Konum ve kategori seçerek el sanatlarına ve atölyelere göz at.</p>
        </section>
        <Explore />
      </>}
    </main>
  </>
);
